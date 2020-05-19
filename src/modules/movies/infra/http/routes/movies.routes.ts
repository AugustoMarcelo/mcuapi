import { Router } from 'express';

import MoviesController from '../controllers/MoviesController';

const moviesRouter = Router();
const moviesController = new MoviesController();

moviesRouter.get('/', moviesController.index);
moviesRouter.post('/', moviesController.create);
moviesRouter.put('/:movie_id', moviesController.update);
moviesRouter.get('/:movie_id', moviesController.show);

export default moviesRouter;
