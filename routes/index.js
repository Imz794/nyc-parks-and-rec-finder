import logsignRoutes from './auth_routes.js';

const configRoutes = (app) => {
  app.use('/', logsignRoutes);
};

export default configRoutes;    