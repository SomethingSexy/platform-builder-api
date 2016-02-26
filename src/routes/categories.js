import Router from 'koa-router';
import Category from '../models/category.js';

const router = new Router({
  prefix: '/api'
});

export default (app) => {
  router.get('/categories', async (ctx, next) => {
    try {
      await next();
      const response = await Category.GetFullArrayTree(); // eslint-disable-line new-cap
      // seems like if there are none, then it returns an object?
      ctx.body = Array.isArray(response) ? response : [];
      ctx.status = 200;
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  return router.routes();
};
