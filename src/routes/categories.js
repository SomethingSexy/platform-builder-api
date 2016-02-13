import Router from 'koa-router';

const router = new Router({
  prefix: '/api'
});

// This will be temporary until we can connect to api server
export default (app) => {
  router.get('/categories', async (ctx, next) => {
    try {
      await next();
      ctx.body = [{id: 1, name: 'Firearm'}];
      ctx.status = 200;
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  return router.routes();
};
