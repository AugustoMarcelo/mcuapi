import { Router } from 'express';

import moviesRouter from '@modules/movies/infra/http/routes/movies.routes';
import tvshowsRouter from '@modules/tvshows/infra/http/routes/tvshows.routes';
import charactersRouter from '@modules/characters/infra/http/routes/characters.routes';
import peopleRouter from '@modules/people/infra/http/routes/people.routes';
import postCreditScenesRouter from '@modules/postCreditScenes/infra/http/routes/post-credit-scenes.routes';
import timelineRouter from '@modules/timeline/infra/http/routes/timeline.routes';
import upcomingRouter from '@modules/upcoming/infra/http/routes/upcoming.routes';
import statsRouter from '@modules/stats/infra/http/routes/stats.routes';
import titlesRouter from '@modules/titles/infra/http/routes/titles.routes';
import searchRouter from '@modules/search/infra/http/routes/search.routes';

const routes = Router();

routes.use('/api/v1/movies', moviesRouter);
routes.use('/api/v1/tvshows', tvshowsRouter);
routes.use('/api/v1/characters', charactersRouter);
routes.use('/api/v1/people', peopleRouter);
routes.use('/api/v1/post-credit-scenes', postCreditScenesRouter);
routes.use('/api/v1/timeline', timelineRouter);
routes.use('/api/v1/upcoming', upcomingRouter);
routes.use('/api/v1/stats', statsRouter);
routes.use('/api/v1/titles', titlesRouter);
routes.use('/api/v1/search', searchRouter);

export default routes;
