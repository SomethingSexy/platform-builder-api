import platformRoutes from './platforms.js';
import categoryRoutes from './categories.js';

export default (app) => {
  app.use(platformRoutes(app));
  app.use(categoryRoutes(app));
};
