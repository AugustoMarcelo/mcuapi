import { Router } from 'express';

import moviesRouter from '@modules/movies/infra/http/routes/movies.routes';
import tvshowsRouter from '@modules/tvshows/infra/http/routes/tvshows.routes';
import charactersRouter from '@modules/characters/infra/http/routes/characters.routes';
import timelineRouter from '@modules/timeline/infra/http/routes/timeline.routes';
import streamingRouter from '@modules/streaming/infra/http/routes/streaming.routes';

const routes = Router();

routes.use('/api/v1/movies', moviesRouter);
routes.use('/api/v1/tvshows', tvshowsRouter);
routes.use('/api/v1/characters', charactersRouter);
routes.use('/api/v1/timeline', timelineRouter);
routes.use('/api/v1/streaming', streamingRouter);

export default routes;
