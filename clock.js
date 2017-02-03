'use strict';

const scrape = require('./bots/scrape');
const express = require('express');
const app = express();
const CronJob = require('cron').CronJob;

const date = 'Wednesday, February 1';
// Scrape House
new CronJob('*/3 * * * * *',
  scrape.scrapeData('2017', 'February', date, 'House'),
  null,
  true,
  'America/Los_Angeles'
);

// Scrape Senate
new CronJob('*/3 * * * * *',
  scrape.scrapeData('2017', 'February', date, 'Senate'),
  null,
  true,
  'America/Los_Angeles'
);


module.exports = app;
