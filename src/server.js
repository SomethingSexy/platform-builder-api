import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import routes from './routes/index.js';
import mongoose from 'mongoose';

// setup mongoose to use Promises instead
mongoose.Promise = global.Promise;

function connect() {
  const options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect('mongodb://localhost/platformbuilder', options).connection;
}

const app = new Koa();

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

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', () => {
    app.listen(process.env.PORT || 5001);
  });


