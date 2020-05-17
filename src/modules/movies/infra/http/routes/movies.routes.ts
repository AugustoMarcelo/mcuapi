import { Router } from 'express';

import MoviesController from '../controllers/MoviesController';

const moviesRouter = Router();
const moviesController = new MoviesController();

moviesRouter.post('/', moviesController.create);

export default moviesRouter;
