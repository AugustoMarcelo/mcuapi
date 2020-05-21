import { Router } from 'express';

import moviesRouter from '@modules/movies/infra/http/routes/movies.routes';
import sessionsRouter from '@modules/users/infra/http/routes/sessions.routes';

const routes = Router();

routes.use('/sessions', sessionsRouter);
routes.use('/api/v1/movies', moviesRouter);

export default routes;
