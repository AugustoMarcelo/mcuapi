import { Router } from 'express';

import StreamingController from '@modules/streaming/infra/http/controllers/StreamingController';
import MoviesController from '../controllers/MoviesController';

const moviesRouter = Router();
const moviesController = new MoviesController();
const streamingController = new StreamingController();

moviesRouter.get('/', moviesController.index);
moviesRouter.get('/:movie_id', moviesController.show);
moviesRouter.get('/:movie_id/streaming', streamingController.byMovie);

export default moviesRouter;
