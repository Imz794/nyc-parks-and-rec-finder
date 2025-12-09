import logsignRoutes from './auth_routes.js';
import listRoutes from './list_routes.js';

const configRoutes = (app) => {
  app.use('/', logsignRoutes);
  app.use('/', listRoutes);
};

export default configRoutes;    