"use strict";

var fs = require('fs');
var path = require('path');

const common = require('./common');
const solc = require('solc');

let web3 = common.initWeb3();

async function deployContract(name, sourceFile) {

  var contractSource   = fs.readFileSync(sourceFile, 'utf8');
  var compiledContract = solc.compile(contractSource, 1);

  console.log(compiledContract);

  return 'deployed contract ' + name + ' with source file ' + sourceFile;
}

module.exports = deployContract;
