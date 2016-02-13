import Router from 'koa-router';
import uuid from 'uuid';
import Platform from '../models/platform.js';

const router = new Router({
  prefix: '/api'
});

// This will be temporary until we can connect to api server
export default (app) => {
  // create a platform
  // this can get called with just a category Id
  router.post('/platform', async (ctx, next) => {
    try {
      await next();
      const platform = new Platform(ctx.request.body);

      await platform.save()
      .then(savedPlatform => {
        // return what was saved
        ctx.body = savedPlatform;
      });

      // we will also need to add a new category

      ctx.status = 200;
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  router.put('/platform/:id', async (ctx, next) => {
    try {
      await next();

      // part diagrams will be stored inpendently of a platform
      // if part is an object we will want to save that separately
      ctx.body = Object.assign({}, ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  router.get('/platform/:id', async (ctx, next) => {
    try {
      await next();
      await Platform.findById(ctx.params.id)
      .then(platform => {
        if (platform) {
          ctx.body = platform;
          ctx.status = 200;
        } else {
          ctx.status = 404;
        }
      })
      .catch(err => {
        ctx.status = 500;
      });
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  // when we post a part it will not be active, until the platform is active
  router.post('/platform/:id/part', async (ctx, next) => {
    try {
      await next();
      ctx.body = Object.assign({}, {
        id: uuid.v4(),
        active: false
      }, ctx.request.body);
      ctx.status = 200;
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  router.del('/platform/:id/part/:partId', async (ctx, next) => {
    try {
      await next();
      // this is what the api will do in the end
      // 1. look up part
      // 2. check to see if it is active
      //    if it is active remove from platform but don't delete part in DB
      //    if it is not active remove from DB and platform
      ctx.status = 200;
      ctx.body = {};
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  return router.routes();
};
