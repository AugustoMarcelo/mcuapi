import TVShowsController from '@modules/tvshows/infra/http/controllers/TVShowsController';
import { Router } from 'express';

const tvshowsRouter = Router();
const tvShowsControler = new TVShowsController();

tvshowsRouter.get('/', tvShowsControler.index);
tvshowsRouter.get('/:tvshow_id', tvShowsControler.show);

export default tvshowsRouter;
