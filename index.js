'use strict';

var path = require('path');
var fs   = require('fs');

const config = require('./app/config');
const common = require('./app/common');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

app.use(bodyParser());

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// set routers
router.get('home', '/', function(ctx, next) {
  ctx.body = 'hello koa2';
});

router.get('deploy', '/deploy/:contractName', async (ctx) => {
  var contractName = ctx.params.contractName;

  console.log('deploy ' + contractName);

  var sourceFile = path.resolve(config.ethereum.contract.sourcePath, contractName + '.sol');

  console.log('contract source file : ' + sourceFile);

  if (!fs.existsSync(sourceFile)) {
    ctx.throw(400, 'contract ' + contractName + ' source file ' + sourceFile + ' not found!');
  }

  ctx.body = 'deploy contract ' + contractName + ' with source file ' + sourceFile;
});

router.get('balance', '/balance/:ethAddress', (ctx) => {
  var address = ctx.params.ethAddress || false;

  console.log('get ' + address + ' balance ');

  if (!address) {
    ctx.throw(400, 'address parameter required!');
  }

  ctx.body = 'get ' + address  + ' balance';
});

// /distribute?to=xxxx&amount=xxxx
router.get('distribute', '/distribute', (ctx) => {
  var  toAddress = ctx.request.query.to || false;
  var  amount = parseInt(ctx.request.query.amount) || false;

  console.log('transfer ' + amount + ' to ' + toAddress);

  if (!toAddress) {
    ctx.throw(400, 'to address parameter required!');
  }

  if (!amount || amount < 1) {
    ctx.throw(400, '1 or above amount required!');
  }

  ctx.body = 'transfer ' + amount + ' to ' + toAddress;
});

// /transfer?from=xxxxx&to=xxxx&amount=xxxx
router.get('transfer', '/transfer', (ctx) => {
  var  fromAddress = ctx.request.query.from || false;
  var  toAddress = ctx.request.query.to || false;
  var  amount = parseInt(ctx.request.query.amount) || false;

  console.log('transfer ' + amount +  ' from ' + fromAddress + ' to ' + toAddress);

  if (!fromAddress) {
    ctx.throw(400, 'from address parameter required!');
  }

  if (!toAddress) {
    ctx.throw(400, 'to address parameter required!');
  }

  if (!amount || amount < 1) {
    ctx.throw(400, '1 or above amount required!');
  }

  ctx.body = 'transfer ' + amount +  ' from ' + fromAddress + ' to ' + toAddress;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port);
console.info("server started on port " + config.port);
