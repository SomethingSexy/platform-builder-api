import platformRoutes from './platform.js';
import categoryRoutes from './categories.js';

export default (app) => {
  app.use(platformRoutes(app));
  app.use(categoryRoutes(app));
};
