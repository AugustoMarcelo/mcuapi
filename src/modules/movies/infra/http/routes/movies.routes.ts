import { Router } from 'express';

import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';
import MoviesController from '../controllers/MoviesController';

const moviesRouter = Router();
const moviesController = new MoviesController();

moviesRouter.get('/', moviesController.index);
moviesRouter.post('/', ensureAuthenticated, moviesController.create);
moviesRouter.put('/:movie_id', ensureAuthenticated, moviesController.update);
moviesRouter.get('/:movie_id', moviesController.show);

export default moviesRouter;
