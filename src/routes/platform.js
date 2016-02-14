import Router from 'koa-router';
import uuid from 'uuid';
import Platform from '../models/platform.js';
import Category from '../models/category.js';

const router = new Router({
  prefix: '/api'
});

function createCategory(rawCategory) {
  return new Category(rawCategory)
    .save();
}

function updatePlatformCategory(platform, category) {
  platform._category = category._id;
  return platform.save();
}

// This will be temporary until we can connect to api server
export default (app) => {
  // create a platform
  // this can get called with just a category Id
  router.post('/platform', async (ctx, next) => {
    try {
      await next();
      let platform = await new Platform(ctx.request.body).save();
      // return what was saved
      ctx.body = platform;
      // if the platform we are creating is active immediately then add the category
      if (platform.active) {
        const category = await createCategory({ name: platform.name, description: platform.description, parentId: null, _platformId: platform._id });
        platform = await updatePlatformCategory(platform, category);
        // override the body here we the latest returned
        ctx.body = platform;
      }
      ctx.status = 200;
    } catch (err) {
      ctx.body = { message: err.message };
      ctx.status = err.status || 500;
    }
  });

  router.put('/platform/:id', async (ctx, next) => {
    try {
      await next();
      // new: true tells the update to return the new model
      // this should handle the adding and removing of sub documents
      // as they are updating the full document at once
      let platform = await Platform.findByIdAndUpdate(ctx.params.id, ctx.request.body, {new: true});
      ctx.body = platform;
      ctx.status = 200;

        // if the platform is active and we don't have a category set yet then 
        // we need to create a category
        // if (platform.active && !platform._category) {
        //   return createCategory({ name: createdPlatform.name, description: createdPlatform.description, parentId: null, _platformId: createdPlatform._id })
        //   .then(updatePlatformCategory.bind(undefined, createdPlatform));
        // }

        // check to see if this platform has a category, if so update it
      if (platform._category) {
        await Category.findByIdAndUpdate(platform._category, {
          name: platform.name,
          description: platform.description
        });
        platform = await Platform.findById(ctx.params.id).populate('_category').exec();
        ctx.body = platform;
      }
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
