import { Router } from 'express';

import moviesRouter from '@modules/movies/infra/http/routes/movies.routes';

const routes = Router();

routes.use('/api/v1/movies', moviesRouter);

export default routes;
