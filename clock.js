'use strict';

const scrape = require('./bots/scrape');
const express = require('express');
const app = express();
const CronJob = require('cron').CronJob;

// Scrape House
new CronJob('*/15 * * * * *',
  scrape.scrapeData('House'),
  null,
  true,
  'America/Los_Angeles'
);

// Scrape Senate
new CronJob('*/15 * * * * *',
  scrape.scrapeData('Senate'),
  null,
  true,
  'America/Los_Angeles'
);


module.exports = app;
