import { Router } from 'express';

import moviesRouter from '@modules/movies/infra/http/routes/movies.routes';

const routes = Router();

routes.use('/movies', moviesRouter);

export default routes;
