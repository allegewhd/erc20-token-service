"use strict";

var version = require('../package.json').version;
var path = require('path');

var env = process.env.NODE_ENV;

var config = {
  version: version,
  debug  : env !== 'production',
  port   : process.env.PORT || 8000,
  ethereum : {
    contract: {
      deployerAddress: '0xc3e836ea59dd855469cd2059e531ddcdbceac78f',
      sourcePath: path.resolve(__dirname, '../contract')
    },
    url: 'http://localhost:8011'
  }
};

// settings by env
if (env === 'production') {

} else if (env === 'stage') {

} else if (env === 'test') {

} else {
  // dev mode

}

module.exports = config;
