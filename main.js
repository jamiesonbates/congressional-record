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
      url = host + '/fdsys/' + subUrl;
      request(url, (err, response, html) => {
        if (!err) {
          const $ = cheerio.load(html);

          const $tables = $('table.page-details-budget-metadata-table');
          const text = $tables.find(`a:contains('Text')`).attr('href');
          const pdf = $tables.find(`a:contains('PDF')`).attr('href');
          const mods = $tables.find(`a:contains('MODS')`).attr('href');

          const category = $tables.find(`tr td:contains('Category')`).next().text();
          const collection = $tables.find(`tr td:contains('Collection')`).next().text();
          const publicationTitle = $tables.find(`tr td:contains('Publication Title')`).next().text().trim().replace(/([\s]{2,})/g, ' ');
          console.log(publicationTitle);
          const suDocClassNumber = $tables.find(`tr td:contains('SuDoc Class Number')`).next().text();
          const publisher = $tables.find(`tr td:contains('Publisher')`).next().text();
          const pageNumberRange = $tables.find(`tr td:contains('Page Number Range')`).next().text();
          const congress = $tables.find(`tr td:contains('Congress')`).next().text();
          const time = $tables.find(`tr td:contains('Time')`).next().text().trim().replace(/([\s]{2,})/g, ' ');
          console.log(time);
          const section = $tables.find(`tr td:contains('Section')`).next().text();
          const subType = $tables.find(`tr td:contains('Sub Type')`).next().text();
          const speakingCongressMember = $tables.find(`tr td:contains('Speaking Congress Member')`).next().text();

          // const $linksTable = $tables['3'];
          // console.log($linksTable);
          // const $infoTable = $tables['4'];
          //
          // if ($linksTable) {
          //   const textUrl = $linksTable.find(`a:contains('Text')`).attr('href');
          //   const pdfUrl = $linksTable.find(`a:contains('PDF')`).attr('href');
          //   const modsUrl = $linksTable.find(`a:contains('MODS')`).attr('href');
          //   console.log(textUrl);
          //   console.log(pdfUrl);
          //   console.log(modsUrl);
          // }
        }
      });
    }
  }

  const getData = function(results) {
    console.log('getData');
    results.forEach((result, index) => {
      request(result, (err, response, html) => {
        if (!err) {
          const $ = cheerio.load(html);
          let text = $('pre').text();
          // const title = extractTitle(text);
          // text = cleanData(text);


          data.push({ url: result, content: text});
        }
        // console.log(data);
      });
    });
  }

  // const cleanData = function(text) {
  //   // console.log('here');
  //   text = text.slice(text.search(/[A-Z]{2}/), text.search(/[__]{2}/));
  //   text = text.replace(/\r?\n|\r/g, '');
  //   return text;
  // }

  // const extractTitle = function(text) {
  //   return text.slice(text.search(/[A-Z]{2}/), text.lastIndexOf(, - 1);
  // }
  first(url);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
