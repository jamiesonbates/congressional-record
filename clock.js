'use strict';

const scrape = require('./bots/scrape');
const express = require('express');
const app = express();

app.get('/scrape', (req, res) => {
  scrape.scrapeData('2016', 'January', 'Tuesday, January 5', 'House');
});

module.exports = app;
