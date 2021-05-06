import { Router } from 'express';

import MoviesController from '../controllers/MoviesController';

const moviesRouter = Router();
const moviesController = new MoviesController();

moviesRouter.get('/', moviesController.index);
moviesRouter.get('/:movie_id', moviesController.show);

export default moviesRouter;
