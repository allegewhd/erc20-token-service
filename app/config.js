"use strict";

var version = require('../package.json').version;
var path = require('path');

var config = {
  version: version,
  debug  : process.env.NODE_ENV !== 'production',
  port   : process.env.PORT || 7001,
  ethereum : {
    url: 'http://localhost:8011'
  }
};

module.exports = config;