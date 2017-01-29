'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/congressional_record_dev'
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};
