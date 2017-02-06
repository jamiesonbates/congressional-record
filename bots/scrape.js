'use strict';

// Dependencies
// const express = require('express');
// const e = express();
const cheerio = require('cheerio');
const request = require('request');
const knex = require('../knex');
const moment = require('moment');

// Variables
// const year = '2011';
// const month = 'January';
// const date = 'Wednesday, January 5';
// const body = 'Senate';

// Send's request to url and returns promise
const getHTML = function(url) {
  const getHTMLPromise = new Promise((resolve, reject) => {
    request.get(url, (err, res, html) => {
      if (err) {
        return reject(err);
      }

      resolve(html);
    })
  });

  return getHTMLPromise;
}

const extractData = function(url, date, year) {
  const extractDataPromise = new Promise((resolve, reject) => {
    request(url, (err, response, html) => {
      if (err) {
        return reject(err);
      }
      const $ = cheerio.load(html);

      // Access HTML Table Where Data is Stored
      const $tables = $('table.page-details-budget-metadata-table');

      // Extract Links
      const textUrl = $tables.find(`a:contains('Text')`).attr('href');
      const pdf = $tables.find(`a:contains('PDF')`).attr('href');
      const mods = $tables.find(`a:contains('MODS')`).attr('href');

      // Extract Meta Data
      const title = $('h3.page-title').text();
      const category = $tables.find(`tr td:contains('Category')`).next().text();
      const collection = $tables.find(`tr td:contains('Collection')`).next().text();
      const publicationTitle = $tables.find(`tr td:contains('Publication Title')`).next().text().trim().replace(/([\s]{2,})/g, ' ');
      const publisher = $tables.find(`tr td:contains('Publisher')`).next().text();
      const pageNumberRange = $tables.find(`tr td:contains('Page Number Range')`).next().text();
      const congress = $tables.find(`tr td:contains('Congress')`).next().text();
      const time = $tables.find(`tr td:contains('Time')`).next().text().trim().replace(/([\s]{2,})/g, ' ');
      const section = $tables.find(`tr td:contains('Section')`).next().text();
      const subType = $tables.find(`tr td:contains('Sub Type')`).next().text();
      const speakingCongressMember = $tables.find(`tr td:contains('Speaking Congress Member')`).next().text();

      let statement = {
        publication_title: publicationTitle,
        title: title,
        speaker: speakingCongressMember,
        date: `${date}, ${year}`,
        time: time,
        page_number_range: pageNumberRange,
        congressional_body: section,
        congress: congress,
        speech_text: '',
        text_url: textUrl,
        pdf_url: pdf,
        mods_url: mods,
        collection_category: category,
        collection: collection,
        publisher: publisher,
        sub_type: subType
      }
      resolve(statement);
    });
  });

  return extractDataPromise;
}

const getText = function(statement) {
  const getTextPromise = new Promise((resolve, reject) => {
    if (!statement.text_url) {
      resolve(statement);
    }

    request(statement.text_url, (err, response, html) => {
      if (err) {
        return reject(err);
      }

      const $ = cheerio.load(html);

      const rawText = $('pre').text();

      let dirtyText = rawText.replace(new RegExp('\\n', 'g'), '');

      dirtyText = dirtyText.slice(dirtyText.lastIndexOf('[www.gpo.gov]'));

      dirtyText = dirtyText.replace('[www.gpo.gov]', '');

      dirtyText = dirtyText.replace(new RegExp(/([A-Z][A-Z \'-.]{1,}[A-Z])[ ]/), '');

      dirtyText = dirtyText.replace(new RegExp(/_{2,}/), '');

      const cleanText = dirtyText.trim();

      statement.speech_text = cleanText;

      resolve(statement);
    });
  });

  return getTextPromise;
}

const determineDateToScrape = function() {
  const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const endOfMonth = {
    'January': 31,
    'February': 28,
    'March': 31,
    'April': 30,
    'May': 31,
    'June': 30,
    'July': 31,
    'August': 31,
    'September': 30,
    'October': 31,
    'November': 30,
    'December': 31
  }
  let year = new Date(Date.now()).getFullYear();
  let month = moment(new Date(Date.now())).format('MMMM');
  let day = moment(new Date(Date.now())).format('dddd');
  let date = moment(new Date(Date.now())).format('D');

  if (day === 'Sunday') {
    return false;
  }
  else if (day === 'Monday') {
    if (date < 4) {
      month = moment(new Date(Date.now())).subtract(1, 'months').format('MMMM');
      date = endOfMonth[month] - (date - 3);
    }
    else {
      date = moment(new Date(Date.now())).subtract(3, 'days').format('D');
    }

    day = 'Friday';

    return [year, month, `${day}, ${month} ${date}`];
  }
  else {
    if (date === 1) {
      month = moment(new Date(Date.now())).subtract(1, 'months').format('MMMM');
      date = endOfMonth[month];
    }
    
    const i = daysOfWeek.indexOf(day);
    const last = daysOfWeek.pop();
    daysOfWeek.unshift(last);
    day = daysOfWeek[i];
    let date = moment(new Date(Date.now())).subtract(1, 'days').format('D');
    console.log('date ' + date);

    return [year, month, `${day}, ${month} ${date}`];
  }
}

// e.get('/scrape', (req, res) => {
const scrapeData = function(body) {
  const dateInfo = determineDateToScrape();
  const year = dateInfo[0];
  const month = dateInfo[1];
  const date = dateInfo[2];
  const longDate = `${date}, ${year}`;
  console.log(longDate);

  const host = 'https://www.gpo.gov';
  const basePath = '/fdsys/browse/collection.action?collectionCode=CREC';
  let url = host + basePath;
  let attr;

  const runScraper = function() {
    return new Promise((resolve, reject) => {
      getHTML(url)
        .then((html) => {
          // Scrape 1st Page - Layer 1
          console.log('layer 1');
          const $ = cheerio.load(html);

          attr = $(`a:contains(${year})`).attr('onclick').slice(12, 119);

          url = host + attr;

          return getHTML(url);
        })
        .then((html) => {
          // Scrape 2nd Page - Layer 2
          console.log('layer 2');
          const $ = cheerio.load(html);

          attr = $(`a:contains(${month})`).attr('onclick').slice(12, 124);

          url = host + attr;

          return getHTML(url);
        })
        .then((html) => {
          // Scrape 3rd Page - Layer 3
          console.log('layer 3');
          const $ = cheerio.load(html);
          const $dateAnchor = $(`a:contains(${date})`);

          if (!$dateAnchor) {
            throw new Error(`Cannot find ${date}`);
          }

          attr = $dateAnchor.attr('onclick').slice(12, 140);

          url = host + attr;

          return getHTML(url);
        })
        .then((html) => {
          // Scrape 4th Page - Layer 4
          console.log('layer 4');
          const $ = cheerio.load(html);

          attr = $(`a:contains(${body})`).attr('onclick').slice(12, 170);

          url = host + attr;
          console.log(url);

          return getHTML(url);
        })
        .then((html) => {
          // Scrape 5th Page - Layer 5
          console.log('layer 5');
          const $ = cheerio.load(html);

          const links = $(`a:contains('More')`);

          const results = [];

          for (const element in links) {
            if (!(links[element].attribs === undefined)) {
              results.push(host + '/fdsys/' + links[element].attribs.href);
            }
          }

          const res = [];
          for (const url of results) {
            res.push(extractData(url, date, year));
          }

          return Promise.all(res);
        })
        .then((statements) => {
          console.log('layer 6');
          const res = [];
          for (const statement of statements) {
            if (statement.speaker) {
              res.push(getText(statement));
            }
          }

          return Promise.all(res);
        })
        .then((statements) => {
          console.log('layer 7');
          if (statements) {
            knex('track_scraper')
              .update('success', true)
              .where('date', longDate)
              .where('body', body)
              .returning('*')
              .then((newScraperDate) => {
                console.log('Speeches scraper from ' + newScraperDate[0].date + 'have success of true');
              })
          }

          return knex('floor_speeches')
            .insert(statements)
        })
        .catch((err) => {
          return err;
        });
    });
  };

  knex('track_scraper')
    .where('date', longDate)
    .where('body', body)
    .returning('*')
    .then((trackDate) => {
      const scraperDate = trackDate[0];

      if (!scraperDate) {
        knex('track_scraper')
          .insert({ date: longDate, success: false, body: body })
          .returning('*')
          .then((updatedTrackDate) => {
            const updatedScraperDate = updatedTrackDate[0];
            console.log('updatedTrackDate = ' + updatedScraperDate);
          })
          .catch((err) => {
            return err;
          });

        console.log(`return promise and add ${longDate} to database`);
        return runScraper();
      }
      else if (scraperDate.success) {
        console.log(`Speeches already collected for ${longDate}`);
        throw new Error(`Speeches already collected for ${longDate}`);
      }
      else {
        console.log(`return promise when data has not been collected for ${longDate}`);
        return runScraper();
      }
    })
    .catch((err) => {
      return err;
    })
};

module.exports = {
  getHTML,
  extractData,
  getText,
  determineDateToScrape,
  scrapeData
}
