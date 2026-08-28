import { Router } from 'express';

import MoviesController from '../controllers/MoviesController';
import MOVIE_COLUMNS from '@modules/movies/entities/movieColumns';
import {
  validateListQuery,
  validatePositiveIntegerParam,
  validateQuery,
} from '@shared/infra/http/requestValidation';

const moviesRouter = Router();
const moviesController = new MoviesController();

moviesRouter.get(
  '/',
  validateListQuery({
    allowList: MOVIE_COLUMNS,
    fields: ['studio', 'continuity', 'multiverse_designation'],
    allowBoolean: true,
  }),
  moviesController.index,
);
moviesRouter.get(
  '/:movie_id',
  validatePositiveIntegerParam('movie_id'),
  validateQuery(),
  moviesController.show,
);

export default moviesRouter;
