# erc20-token-service

A [koajs](http://koajs.com/) application for deploying [ERC20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md)  token and access by REST api.

## requirement

+ nodejs 7.6.0+ (async and await)
+ koajs 2.3+
+ web3.js 1.0.0-beta.xx
  + some api changed
+ geth 1.6.x(latest go-ethereum)
  + compiled with golang 1.9+
+ solc-js 0.4.16+

## quickstart

### start local geth node with private network for development

check `geth` and `solc` command exists on macOS sierra

```bash
# solc --version
solc, the solidity compiler commandline interface
Version: 0.4.17-develop.2017.9.19+commit.137b214b.Darwin.appleclang

# geth version
Geth
Version: 1.7.0-unstable
Git Commit: 79b11121a7e4beef0d0297894289200b9842c36c
Architecture: amd64
Protocol Versions: [63 62]
Network Id: 1
Go Version: go1.9
Operating System: darwin
GOPATH=/Users/wang/gohome
GOROOT=/usr/local/Cellar/go/1.9/libexec
```

run local geth node from npm scripts:

```bash
# npm run geth_console # mining not start
```

or you can run `./ethereum/start.sh -m` with mining started when geth node start.
another option is `./ethereum/start.sh -r` will clear node data and start as new node.
`start.sh` command will init node with `genesis.json` automatically.

geth node data created by `start.sh` will be in `[start.sh folder]/data/dev`.

```bash
 # ll
total 24K
drwxr-xr-x  9 wang staff  306  9 20 17:08 ./
drwxr-xr-x 15 wang staff  510  9 20 23:33 ../
-rw-------  1 wang staff  491  9 21 15:40 UTC--2017-09-20T08-01-31.698027682Z--c3e836ea59dd855469cd2059e531ddcdbceac78f # primary account
-rw-------  1 wang staff  491  9 21 15:40 UTC--2017-09-20T08-03-53.498859729Z--e169dc2cf67b86096ca50bf1371464542c73f5bc # coinbase account for mining
-rw-r--r--  1 wang staff    7  9 21 15:41 account_unlock_pass # primary account password file for unlock on geth node starting
-rwxr-xr-x  1 wang staff  471  9 12 16:00 attach.sh* # attach to running geth node
drwxr-xr-x  4 wang staff  136  9 20 17:08 data/  # geth node data folder
-rw-r--r--  1 wang staff  627  9 20 17:05 genesis.json  # genesis block config file
-rwxr-xr-x  1 wang staff 3.4K  9 21 15:47 start.sh* # start geth ndoe


 # tree data
data
├── dev
│   ├── geth
│   │   ├── LOCK
│   │   ├── chaindata
│   │   │   ├── 000002.ldb
│   │   │   ├── 000003.log
│   │   │   ├── CURRENT
│   │   │   ├── LOCK
│   │   │   ├── LOG
│   │   │   └── MANIFEST-000004
│   │   ├── lightchaindata
│   │   │   ├── 000001.log
│   │   │   ├── CURRENT
│   │   │   ├── LOCK
│   │   │   ├── LOG
│   │   │   └── MANIFEST-000000
│   │   ├── nodekey
│   │   └── transactions.rlp
│   ├── history
│   └── keystore
│       ├── UTC--2017-09-20T08-01-31.698027682Z--c3e836ea59dd855469cd2059e531ddcdbceac78f
│       └── UTC--2017-09-20T08-03-53.498859729Z--e169dc2cf67b86096ca50bf1371464542c73f5bc
└── ethdash
    ├── full-R23-0000000000000000
    └── full-R23-290decd9548b62a8

6 directories, 19 files
```

### start koajs app

```bash
# npm start

> erc20-token-service@1.0.0 start /Users/wang/work/erc20-token-service
> node -v; npm -v; node ./index.js

v8.4.0
5.4.2
2017-09-21 15:54:17.804 INFO   start erc20 token service 1.0.0
2017-09-21 15:54:18.914 LOG    initialize web3, connect to ethereum chain node
2017-09-21 15:54:18.914 LOG    connect to ethereum chain http://localhost:8011
2017-09-21 15:54:18.924 LOG    initialize web3, connect to ethereum chain node
2017-09-21 15:54:19.024 INFO   server started on port 8000

```

config file is `app/config.js`
deploy contract source files are placed in `contract` folder.

```bash
# ll contract/
total 28K
drwxr-xr-x  9 wang staff  306  9 19 14:20 ./
drwxr-xr-x 15 wang staff  510  9 20 23:33 ../
-rw-r--r--  1 wang staff 1.1K  9 18 00:39 BasicToken.sol
-rw-r--r--  1 wang staff  488  9 14 12:26 ERC20.sol
-rw-r--r--  1 wang staff  409  9 14 12:26 ERC20Basic.sol
-rw-r--r--  1 wang staff  666  9 20 15:38 FixedCapSampleCoin.sol
-rw-r--r--  1 wang staff  529  9 14 12:27 Math.sol
-rw-r--r--  1 wang staff  816  9 14 12:27 SafeMath.sol
-rw-r--r--  1 wang staff 3.4K  9 18 00:40 StandardToken.sol
```

we create fixed volume ERC20 token with `FixedCapSampleCoin.sol` contract:

```javascript
# cat contract/FixedCapSampleCoin.sol

pragma solidity ^0.4.11;


import './StandardToken.sol';


contract FixedCapSampleCoin is StandardToken {

    // metadata
    string  public constant name      = "Fixed Cap Sample Coin";
    string  public constant symbol    = "FCSC";
    string  public constant version   = "1.0";
    uint256 public constant decimals  = 3;
    bool    public constant immutable = true;
    uint256 public constant volume    =  42 * (10**9) * (10**decimals);

    // contract owner(deployer)
    address public owner;

    // constructor
    function FixedCapSampleCoin() {
        owner = msg.sender;
        totalSupply = volume;
        balances[owner] = totalSupply;
    }

}

```

deploy the above contract with command:

```bash
# curl -Ssv http://localhost:8000/deploy/FixedCapSampleCoin
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8000 (#0)
> GET /deploy/FixedCapSampleCoin HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=utf-8
< Content-Length: 37
< Date: Thu, 21 Sep 2017 06:59:31 GMT
< Connection: keep-alive
<
* Connection #0 to host localhost left intact
contract FixedCapSampleCoin deployed.

```

deployed contract meta data was save to `runtime/contract/FixedCapSampleCoin.json` file.

```json
# cat runtime/contract/FixedCapSampleCoin.json
{
  "contractName": "FixedCapSampleCoin",
  "contractFile": "/Users/wang/work/erc20-token-service/contract/FixedCapSampleCoin.sol",
  "contractAbi": "[{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_from\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseApproval\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"balance\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"immutable\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"volume\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_spender\",\"type\":\"address\"},{\"name\":\"_addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseApproval\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"_owner\",\"type\":\"address\"},{\"name\":\"_spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"remaining\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"}]",
  "transactionHash": "0xcb83e07a42e6a9e8e473080f6aeddae0bc14f07da8e20e92bb7c917bfd5ec4f7",
  "contractAddress": "0x6322cB7a3519A41b768050F98Ee1347346406037",
  "deployerAddress": "0xc3e836ea59dd855469cd2059e531ddcdbceac78f",
  "deployGasUsed": 830863,
  "deployBlockHash": "0xe054abb6c3ee169dab28f0fc4178f910fad72b3ac83e213b0060a8d91fd72220",
  "deployBlockNumber": 29
}
```

we will use above file to call contract methods.

1. get balance of an account

```bash
# curl -Ssv http://localhost:8000/balance/0xc3e836ea59dd855469cd2059e531ddcdbceac78f
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8000 (#0)
> GET /balance/0xc3e836ea59dd855469cd2059e531ddcdbceac78f HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=utf-8
< Content-Length: 76
< Date: Thu, 21 Sep 2017 07:13:22 GMT
< Connection: keep-alive
<
* Connection #0 to host localhost left intact
address 0xc3e836ea59dd855469cd2059e531ddcdbceac78f balance is 42000000000000

```


2. distribute our ERC20 token to account

```bash
# curl -Ssv 'http://localhost:8000/distribute?to=0xe169dc2cf67b86096ca50bf1371464542c73f5bc&amount=1250'
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8000 (#0)
> GET /distribute?to=0xe169dc2cf67b86096ca50bf1371464542c73f5bc&amount=1250 HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=utf-8
< Content-Length: 59
< Date: Thu, 21 Sep 2017 07:15:44 GMT
< Connection: keep-alive
<
* Connection #0 to host localhost left intact
transfer 1250 to 0xe169dc2cf67b86096ca50bf1371464542c73f5bc

# curl -Ssv http://localhost:8000/balance/0xe169dc2cf67b86096ca50bf1371464542c73f5bc
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8000 (#0)
> GET /balance/0xe169dc2cf67b86096ca50bf1371464542c73f5bc HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=utf-8
< Content-Length: 66
< Date: Thu, 21 Sep 2017 07:16:21 GMT
< Connection: keep-alive
<
* Connection #0 to host localhost left intact
address 0xe169dc2cf67b86096ca50bf1371464542c73f5bc balance is 1250
```

3. transfer some token

using API `curl -Ssv 'http://localhost:8000/transfer?from=xxxx&to=xxx&amount=xxx'`

this API is not implemented yet.

### connect testnet to test

TBA

So far, we use `await` and `async` when calling contract methods. When on public network, callback function is a better choice.

### connect mainnet

TBA


Happy hacking!
