import { Router } from 'express';

import moviesRouter from '@modules/movies/infra/http/routes/movies.routes';
import tvshowsRouter from '@modules/tvshows/infra/http/routes/tvshows.routes';
import charactersRouter from '@modules/characters/infra/http/routes/characters.routes';
import timelineRouter from '@modules/timeline/infra/http/routes/timeline.routes';
import upcomingRouter from '@modules/upcoming/infra/http/routes/upcoming.routes';
import statsRouter from '@modules/stats/infra/http/routes/stats.routes';

const routes = Router();

routes.use('/api/v1/movies', moviesRouter);
routes.use('/api/v1/tvshows', tvshowsRouter);
routes.use('/api/v1/characters', charactersRouter);
routes.use('/api/v1/timeline', timelineRouter);
routes.use('/api/v1/upcoming', upcomingRouter);
routes.use('/api/v1/stats', statsRouter);

export default routes;
