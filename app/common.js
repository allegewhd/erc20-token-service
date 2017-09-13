"use strict";

const config         = require('config');
const Sequelize      = require("sequelize");
const Web3           = require('web3');
const util           = require('util');
const crypto         = require('crypto');
const jwt            = require('jsonwebtoken');

const env            = process.env.APP_RUN_MODE || 'development';
const productionMode = (env === 'production');

var   moment         = require("moment");

// util functions
const Reset      = "\x1b[0m";
const Bright     = "\x1b[1m";
const Dim        = "\x1b[2m";
const Underscore = "\x1b[4m";
const Blink      = "\x1b[5m";
const Reverse    = "\x1b[7m";
const Hidden     = "\x1b[8m";

const FgBlack    = "\x1b[30m";
const FgRed      = "\x1b[31m";
const FgGreen    = "\x1b[32m";
const FgYellow   = "\x1b[33m";
const FgBlue     = "\x1b[34m";
const FgMagenta  = "\x1b[35m";
const FgCyan     = "\x1b[36m";
const FgWhite    = "\x1b[37m";

const BgBlack    = "\x1b[40m";
const BgRed      = "\x1b[41m";
const BgGreen    = "\x1b[42m";
const BgYellow   = "\x1b[43m";
const BgBlue     = "\x1b[44m";
const BgMagenta  = "\x1b[45m";
const BgCyan     = "\x1b[46m";
const BgWhite    = "\x1b[47m";

// colorful output for console methods
var funcs = {
  log: {
    func: console.log.bind(console),
    name: "LOG   ",
    color: FgGreen
  },
  info: {
    func: console.info.bind(console),
    name: "INFO  ",
    color: FgBlue
  },
  warn: {
    func: console.warn.bind(console),
    name: "WARN  ",
    color: FgYellow
  },
  error: {
    func: console.error.bind(console),
    name: "ERROR ",
    color: FgRed
  }
};

Object.keys(funcs).forEach(function(k) {
  console[k] = function() {
    var prefix = funcs[k].color + moment().format("YYYY-MM-DD HH:mm:ss.SSS") + " " + funcs[k].name + Reset;
    arguments[0] = util.format(prefix, arguments[0]);
    funcs[k].func.apply(console, arguments);
  };
});

console.info("start worktime backend service ... ");
console.log("running on " + env + " mode");

const cryptoConfig = {
  salt            : (process.env.APP_CRYPTO_SALT || config.get('app.crypto.salt')),
  algorithm       : config.get('app.crypto.algorithm'),
  inputEncoding   : config.get('app.crypto.input_encoding'),
  outputEncoding  : config.get('app.crypto.output_encoding')
};

console.log("app crypto config : ");
console.log(cryptoConfig);

const authConfig = {
  enable        : config.get('app.auth.enable'),
  secret        : (process.env.APP_AUTH_JWT_SECRET || config.get('app.auth.secret')),
  tokenExpire   : config.get('app.auth.token_expire'), // in seconds, default 3 months
  algorithms    : config.get('app.auth.algorithms'),
  issuer        : config.get('app.auth.token_issuer'),
  cookieKey     : config.get("app.auth.cookie_key"),
  cookieOptions : {
    ttl          : null,           // valid only in memory
    encoding     : 'none',         // we already used JWT to encode
    isSecure     : productionMode, // warm & fuzzy feelings
    isHttpOnly   : true,           // prevent client alteration
    clearInvalid : false,          // remove invalid cookies
    strictHeader : true            // don't allow violations of RFC 6265
  }
};

console.log("app auth config : ");
console.log(authConfig);

function initSequelize() {
  var sequelize;

  // initialize database connection
  if (productionMode) {
    sequelize = new Sequelize(
      config.get('database.production.name'),
      config.get('database.production.username'),
      decrypt(config.get('database.production.password')),
      {
        dialect: config.get('database.production.dialect'),
        host: config.get('database.production.host'),
        port: config.get('database.production.port'),
        define: {
          charset: 'utf8',
          collate: 'utf8_general_ci'
        },
        pool: {
          max: config.get('database.production.pool.max'),
          min: config.get('database.production.pool.min'),
          idle: config.get('database.production.pool.idle')
        }
      }
    );

    console.log("using " + config.get('database.production.host') + " " +
        config.get('database.production.dialect') + " production database");
  } else if (env == 'test' || env == 'aws_test') {
    var dbConfig = config.get('database.' + env);

    sequelize = new Sequelize(
      dbConfig['name'],
      dbConfig['username'],
      decrypt(dbConfig['password']),
      {
        dialect: dbConfig['dialect'],
        host: dbConfig['host'],
        port: dbConfig['port'],
        define: {
          charset: 'utf8',
          collate: 'utf8_general_ci'
        },
        pool: {
          max: dbConfig['pool']['max'],
          min: dbConfig['pool']['min'],
          idle: dbConfig['pool']['idle']
        }
      }
    );

    console.log("using " + dbConfig['host'] + " " + dbConfig['dialect'] + " database");
  } else {
    sequelize = new Sequelize(config.get('database.development.name'), '', '', {
      dialect: config.get('database.development.dialect'),
      storage: config.get('database.development.storage')
    });

    console.log("using " + config.get('database.development.dialect') + " database");
  }

  return sequelize;
}

function initWeb3js() {
  var web3;

  console.log("initialize web3, connect to ethereum chain node");

  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    var ethUrl = process.env.ETH_NODE_URL || null;

    if (!ethUrl) {
      if (productionMode) {
        ethUrl = config.get('blockchain.ethereum.connection.production.protocol') + '://'
          + config.get('blockchain.ethereum.connection.production.host') + ':'
          + config.get('blockchain.ethereum.connection.production.port');
      } else {
        ethUrl = config.get('blockchain.ethereum.connection.development.protocol') + '://'
          + config.get('blockchain.ethereum.connection.development.host') + ':'
          + config.get('blockchain.ethereum.connection.development.port');
      }
    }

    console.log('connect to ethereum chain ' + ethUrl);

    web3 = new Web3(new Web3.providers.HttpProvider(ethUrl));
  }

  return web3;
}

function dump(v) {
  return console.log(util.inspect(v));
}

function timestampToDayMonth(timestamp) {
    var t = new Date(parseInt(timestamp, 10));

    var month = '' + t.getFullYear() + ('0' + (t.getMonth() + 1)).substr(-2);
    var day = month + ('0' + t.getDate()).substr(-2);

    return {
      day: day,
      month: month
    };
}

function encrypt(text) {
  var cipher = crypto.createCipher(cryptoConfig.algorithm, cryptoConfig.salt);
  var ciphered = cipher.update(text, cryptoConfig.inputEncoding, cryptoConfig.outputEncoding);
  ciphered += cipher.final(cryptoConfig.outputEncoding);

  return ciphered;
}

function decrypt(cryptedText) {
  var decipher = crypto.createDecipher(cryptoConfig.algorithm, cryptoConfig.salt);
  var deciphered = decipher.update(cryptedText, cryptoConfig.outputEncoding, cryptoConfig.inputEncoding);
  deciphered += decipher.final(cryptoConfig.inputEncoding);

  return deciphered;
}

function checkCrypted(plain, crypted) {
  return (plain == decrypt(crypted));
}

function generateToken(obj) {
  var target = {
    iss: authConfig.issuer,
    exp: Math.floor(new Date().getTime()/1000) + authConfig.tokenExpire
  };

  // copy object properties to target
  Object.keys(obj).forEach(function(key) {
    target[key] = obj[key];
  });

  var token = jwt.sign(target, authConfig.secret);

  return token;
}

var common = {};

common.env                        = env;
common.productionMode             = productionMode;

common.Sequelize                  = Sequelize;
common.sequelize                  = initSequelize();

common.authConfig                 = authConfig;

common.initSequelize              = initSequelize;
common.initWeb3js                 = initWeb3js;

common.dump                       = dump;
common.timestampToDayMonth        = timestampToDayMonth;

common.encrypt                    = encrypt;
common.decrypt                    = decrypt;
common.checkCrypted               = checkCrypted;

common.generateToken              = generateToken;

module.exports = common;
