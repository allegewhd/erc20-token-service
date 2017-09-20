"use strict";

const config = require('./config');
const Web3   = require('web3');
const util   = require('util');
const fs     = require('fs');
const path   = require('path');
const fse    = require('fs-extra');

var   moment     = require("moment");

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

console.info("start erc20 token service " + config.version);

function initWeb3() {
  var web3;

  console.log("initialize web3, connect to ethereum chain node");

  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    var ethUrl = process.env.ETH_NODE_URL || null;

    if (!ethUrl) {
        ethUrl = config.ethereum.url;
    }

    console.log('connect to ethereum chain ' + ethUrl);

    web3 = new Web3(new Web3.providers.HttpProvider(ethUrl));
  }

  return web3;
}

function dump(v) {
  return console.log(util.inspect(v));
}

function readJsonFile(fileName) {
  let filePath = path.resolve(config.ethereum.contract.outputPath, fileName);

  if (!fs.existsSync(filePath)) {
    return "";
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile(fileName, dataObj) {
  let dir = config.ethereum.contract.outputPath;

  if (!fs.existsSync(dir)) {
    fse.mkdirsSync(dir);
  }

  var filePath = path.resolve(dir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(dataObj, null, 2), 'utf8');
}

var common = {};

common.initWeb3                   = initWeb3;
common.dump                       = dump;
common.writeJsonFile              = writeJsonFile;
common.readJsonFile               = readJsonFile;

module.exports = common;
