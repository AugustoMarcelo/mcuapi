import { Router } from 'express';

import moviesRouter from '@modules/movies/infra/http/routes/movies.routes';
import tvshowsRouter from '@modules/tvshows/infra/http/routes/tvshows.routes';

const routes = Router();

routes.use('/api/v1/movies', moviesRouter);
routes.use('/api/v1/tvshows', tvshowsRouter);

export default routes;
