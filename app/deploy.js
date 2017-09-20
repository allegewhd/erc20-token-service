"use strict";

var fs   = require('fs');
var path = require('path');

const common = require('./common');
const config = require('./config');
const solc   = require('solc');

let web3 = common.initWeb3();

async function deployContract(name) {
  let jsonFileName = name + '.json';
  var contractMetaData = {
    contractName: name,
    contractFile: path.resolve(config.ethereum.contract.sourcePath, name + '.sol')
  };

  // load all sol files in source directory
  var sourceFiles = fs.readdirSync(config.ethereum.contract.sourcePath);
  var sourceContents = {};
  for (let f of sourceFiles) {
    if (f.endsWith('.sol')) {
      sourceContents[f] = fs.readFileSync(path.resolve(config.ethereum.contract.sourcePath, f), 'utf8');
    }
  }

  // common.dump(sourceContents);

  var compiledContract = solc.compile({sources: sourceContents}, 1);

  console.log(compiledContract);

  let deployer = config.ethereum.contract.deployerAddress;
  console.log('deploy contract with account ', deployer);

  var compiledContractName = name + '.sol:' + name;

  var contractAbi      = compiledContract.contracts[compiledContractName].interface;
  var contractBytecode = '0x' + compiledContract.contracts[compiledContractName].bytecode;
  var gasEstimate      = await web3.eth.estimateGas({
    to  : deployer,
    data: contractBytecode
  });

  console.log('estimated gas: ', gasEstimate);

  contractMetaData.contractAbi = contractAbi;

  // from web3.js 1.0.x, API changed
  var contractInstance = new web3.eth.Contract(JSON.parse(contractAbi));

  contractInstance.deploy({
    data: contractBytecode
  }).send({
    from: deployer,
    gas : 1000000 + gasEstimate,
    gasPrice: '20000000000'
  }).on('error', (error) => {
    console.error("deploy error!", error);
  }).on('transactionHash', (transactionHash) => {
    console.log("deploy transaction hash: ", transactionHash);
  }).on('receipt', (receipt) => {
    console.log('deployed at ', receipt);

    contractMetaData.transactionHash   = receipt.transactionHash;
    contractMetaData.contractAddress   = receipt.contractAddress;
    contractMetaData.deployerAddress   = receipt.from;
    contractMetaData.deployGasUsed     = receipt.gasUsed;
    contractMetaData.deployBlockHash   = receipt.blockHash;
    contractMetaData.deployBlockNumber = receipt.blockNumber;

    common.writeJsonFile(jsonFileName, contractMetaData);
  });

  return 'contract ' + name + ' deployed.';
}

module.exports = deployContract;
