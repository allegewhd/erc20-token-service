"use strict";

const common = require('./common');
const config = require('./config');

// TODO assume we know token contract name
const contractName = 'FixedCapSampleCoin';

let web3 = common.initWeb3();

let contractMetaFileName = contractName + '.json';
let metaData = common.readJsonFile(contractMetaFileName);
let contractInstance = new web3.eth.Contract(JSON.parse(metaData.contractAbi), metaData.contractAddress);

async function balanceOf(address) {
  var balanceAmount = await contractInstance.methods.balanceOf(address).call({from: address});

  console.log("balance of address " + address + ' is ' + balanceAmount);

  return balanceAmount;
}

async function distributeToken(toAddress, amount) {
  var result = await contractInstance.methods.transfer(toAddress, amount).send({from: config.ethereum.contract.deployerAddress});

  console.log('distribute result ', result);

  return result;
}

async function transferToken(fromAddress, toAddress, amount) {
  // TODO need prepare from account, give some ETH and unlock it
}

var api = {
  balance    : balanceOf,
  distribute : distributeToken,
  transfer   : transferToken
};

module.exports = api;
