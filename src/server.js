import Koa from 'koa';
import koaStatic from 'koa-static';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';
import routes from './routes/index.js';

const app = new Koa();

// setup our static loader, we need to use convert because this is old middleware
app.use(convert(koaStatic('public', {})));

// logger
app.use(async (ctx, next) => {
  const start = new Date;
  await next();
  const ms = new Date - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// setup the body parser
app.use(bodyParser());

routes(app);

app.listen(process.env.PORT || 5001);
