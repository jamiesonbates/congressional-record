'use strict';

// Dependencies
const express = require('express');
const app = express();
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

// Variables
const results = [];
const data = [];

const year = '2016';
const month = 'January';
const date = 'Tuesday, January 12';
const body = 'House';

const host = 'https://www.gpo.gov';

app.get('/scrape', (req, res) => {
  // scraper

  // parameters
  let url = host + '/fdsys/browse/collection.action?collectionCode=CREC';
  let attr = '';

  // request functions

  const first = function(url) {
    console.log('first');
    request(url, (err, response, html) => {
      if (!err) {
        const $ = cheerio.load(html);

        attr = $(`a:contains(${year})`).attr('onclick').slice(12, 119);

        url = host + attr;
        console.log(url);
      }
      second(url);
    });
  }

  const second = function(url) {
    console.log('second');
    request(url, (err, response, html) => {
      if (!err) {
        const $ = cheerio.load(html);

        attr = $(`a:contains(${month})`).attr('onclick').slice(12, 124);

        url = host + attr;
        console.log(url);
      }
      third(url);
    });
  }

  const third = function(url) {
    console.log('third');
    request(url, (err, response, html) => {
      if (!err) {
        const $ = cheerio.load(html);

        attr = $(`a:contains(${date})`).attr('onclick').slice(12, 140);

        url = host + attr;
        console.log(url);
      }
      fourth(url);
    });
  }

  const fourth = function(url) {
    console.log('fourth');
    request(url, (err, response, html) => {
      if (!err) {
        const $ = cheerio.load(html);

        attr = $(`a:contains(${body})`).attr('onclick').slice(12, 170);

        url = host + attr;
        console.log(url);
      }
      fifth(url);
    })
  }

  const fifth = function(url) {
    console.log('fifth');
    request(url, (err, response, html) => {
      if (!err) {
        const $ = cheerio.load(html);

        const links = $(`a:contains('More')`);

        for (const element in links) {
          if (!(links[element].attribs === undefined)) {
            results.push(links[element].attribs.href);
          }
        }

        sixth(results);
      }
    });
  }

  const sixth = function(arr) {
    console.log('sixth');
    for (const subUrl of arr) {
      let statement;
      url = host + '/fdsys/' + subUrl;
      request(url, (err, response, html) => {
        if (!err) {
          const $ = cheerio.load(html);

          const $tables = $('table.page-details-budget-metadata-table');

          const title = $('h3.page-title').text();

          const textUrl = $tables.find(`a:contains('Text')`).attr('href');
          const pdf = $tables.find(`a:contains('PDF')`).attr('href');
          const mods = $tables.find(`a:contains('MODS')`).attr('href');

          const category = $tables.find(`tr td:contains('Category')`).next().text();
          const collection = $tables.find(`tr td:contains('Collection')`).next().text();
          const publicationTitle = $tables.find(`tr td:contains('Publication Title')`).next().text().trim().replace(/([\s]{2,})/g, ' ');
          const suDocClassNumber = $tables.find(`tr td:contains('SuDoc Class Number')`).next().text();
          const publisher = $tables.find(`tr td:contains('Publisher')`).next().text();
          const pageNumberRange = $tables.find(`tr td:contains('Page Number Range')`).next().text();
          const congress = $tables.find(`tr td:contains('Congress')`).next().text();
          const time = $tables.find(`tr td:contains('Time')`).next().text().trim().replace(/([\s]{2,})/g, ' ');
          const section = $tables.find(`tr td:contains('Section')`).next().text();
          const subType = $tables.find(`tr td:contains('Sub Type')`).next().text();
          const speakingCongressMember = $tables.find(`tr td:contains('Speaking Congress Member')`).next().text();

          statement = {
            statement: {
              publication_title: publicationTitle,
              title: title,
              speaker: speakingCongressMember,
              date: `${date}, ${year}`,
              time: time,
              page_number_range: pageNumberRange,
              congressional_body: section,
              congress: congress,
              text: ''
            },
            url: {
              textUrl: textUrl,
              pdf: pdf,
              mods: mods
            },
            meta: {
                collection_category: category,
                collection: collection,
                sudoc_class_number: suDocClassNumber,
                publisher: publisher,
                sub_type: subType
            }
          };
          // console.log(statement);
        }
      });
    }

    // for (const dat of data) {
    //   dat.statement.text = getText(dat.url.textUrl);
    //   console.log(data);
    // }
  }

  const getText = function(url) {
    console.log('getText');
    request(url, (err, response, html) => {
      if (!err) {
        const $ = cheerio.load(html);

        const text = $('pre').text();

        return text;
      }
    });
  }

  first(url);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
