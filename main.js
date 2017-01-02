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
      final(url);
    })
  }

  const final = function(url) {
    console.log('final');
    request(url, (err, response, html) => {
      if (!err) {
        const $ = cheerio.load(html);

        const links = $(`a:contains('Text')`);

        for (const element in links) {
          if (!(links[element].attribs === undefined)) {
            results.push(links[element].attribs.href);
          }
        }
        results.pop();
        getData(results);
      }
    });
  }

  const getData = function(results) {
    console.log('getData');
    results.forEach((result, index) => {
      request(result, (err, response, html) => {
        if (!err) {
          const $ = cheerio.load(html);
          let text = $('pre').text();
          const title = extractTitle(text);
          text =


          data.push({ url: result, content: text, title: title});
        }
        console.log(data);
      });
    });
  }

  const select = function(text) {
    return text = text.slice(text.search(/[A-Z]{2}$/), text.search(/[__]{2}/));
  }

  const removeNewLines = function(text) {
    return text = text.replace(/\r?\n|\r/g, '');
  }

  const extractTitle = function(text) {
    return text.slice(text.search(/[A-Z]{2}/), text.indexOf('\n') - 1);
  }
  first(url);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
