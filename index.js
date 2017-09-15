'use strict';

const Koa = require('koa');
const app = new Koa();

const common =  require('./app/common');

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(ctx => {
    ctx.body = 'hello koa2';
});

app.listen(8000);
