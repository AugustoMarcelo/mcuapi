import TVShowsController from '@modules/tvshows/infra/http/controllers/TVShowsController';
import StreamingController from '@modules/streaming/infra/http/controllers/StreamingController';
import { Router } from 'express';

const tvshowsRouter = Router();
const tvShowsControler = new TVShowsController();
const streamingController = new StreamingController();

tvshowsRouter.get('/', tvShowsControler.index);
tvshowsRouter.get('/:tvshow_id', tvShowsControler.show);
tvshowsRouter.get('/:tvshow_id/streaming', streamingController.byTVShow);

export default tvshowsRouter;
