import Router from 'koa-router';
import uuid from 'uuid';
import Platform from '../models/platform.js';
import Category from '../models/category.js';
import PartDefinition from '../models/partDefinition.js';

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

function handleError(error) {
  const response = {};
  if (error.name === 'ValidationError') {
    const errors = Object.keys(error.errors).map((field) => {
      return {
        field,
        kind: error.errors[field].kind,
        value: error.errors[field].value,
        message: error.errors[field].message
      };
    });
    response.body = errors;
    response.status = 400;
  } else {
    response.body = { message: error.message };
    response.status = error.status || 500;
  }

  return response;
}

// This will be temporary until we can connect to api server
export default (app) => {
  // create a platform
  // this can get called with just a category Id
  router.post('/platform', async (ctx, next) => {
    try {
      await next();
      let platform = await new Platform(ctx.request.body).save();

      // if the platform we are creating is active immediately then add the category
      if (platform.active) {
        const category = await createCategory({ name: platform.name, description: platform.description, parentId: null, _platformId: platform._id });
        platform = await updatePlatformCategory(platform, category);
        // populate after save without having to refetch everything
        await Platform.populate(platform, {path: '_category'});
      }
      // return what was saved
      ctx.body = platform;
      ctx.status = 200;
    } catch (err) {
      const response = handleError(err);
      ctx.body = response.body;
      ctx.status = response.status;
    }
  });

  router.put('/platform/:id', async (ctx, next) => {
    try {
      await next();
      // new: true tells the update to return the new model
      // this should handle the adding and removing of sub documents
      // as they are updating the full document at once
      let platform = await Platform.findByIdAndUpdate(ctx.params.id, ctx.request.body, {new: true});

      // if the platform is active and we don't have a category set yet then
      // we need to create a category
      if (platform.active && !platform._category) {
        const category = await createCategory({ name: platform.name, description: platform.description, parentId: null, _platformId: platform._id });
        platform = await updatePlatformCategory(platform, category);
        // populate after save without having to refetch everything
        await Platform.populate(platform, {path: '_category'});
      } else if (platform._category) {  // check to see if this platform has a category, if so update it
        await Category.findByIdAndUpdate(platform._category, {
          name: platform.name,
          description: platform.description
        });
        platform = await Platform.findById(ctx.params.id).populate('_category').exec();
      }

      ctx.body = platform;
      ctx.status = 200;
    } catch (err) {
      const response = handleError(err);
      ctx.body = response.body;
      ctx.status = response.status;
    }
  });

  router.get('/platform/:id', async (ctx, next) => {
    try {
      await next();
      // make sure to populate category and parts
      const platform = await Platform.findById(ctx.params.id).populate('_category parts').exec();
      if (platform) {
        ctx.body = platform;
        ctx.status = 200;
      } else {
        ctx.status = 404;
      }
    } catch (err) {
      const response = handleError(err);
      ctx.body = response.body;
      ctx.status = response.status;
    }
  });

  // when we post a part it will not be active, until the platform is active
  router.post('/platform/:id/part', async (ctx, next) => {
    try {
      await next();
      // create the part Definition
      const partDefinition = await new PartDefinition(Object.assign({
        active: false,
        _createdPlatformId: ctx.params.id
      }, ctx.request.body)).save();
      // now find the platform
      await Platform.findByIdAndUpdate(ctx.params.id, {
        $push: {
          'parts': partDefinition._id
        }
      }, {
        safe: true
      });

      ctx.body = partDefinition;
      ctx.status = 200;
    } catch (err) {
      const response = handleError(err);
      ctx.body = response.body;
      ctx.status = response.status;
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
      const response = handleError(err);
      ctx.body = response.body;
      ctx.status = response.status;
    }
  });

  return router.routes();
};
