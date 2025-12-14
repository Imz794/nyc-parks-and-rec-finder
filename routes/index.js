import logsignRoutes from './auth_routes.js';
import listRoutes from './list_routes.js';
import facilityRoutes from './facility_routes.js';
import profileRoutes from './profile_routes.js';
import likesRoutes from './likes_routes.js';
import reviewRoutes from './review_routes.js';
import commentRoutes from './comment_routes.js'; 

const configRoutes = (app) => {
  app.use('/', logsignRoutes);
  app.use('/', listRoutes);
  app.use('/', facilityRoutes);
  app.use('/', profileRoutes);
  app.use('/', likesRoutes);
  app.use('/', reviewRoutes);
  app.use('/', commentRoutes);
};

export default configRoutes;