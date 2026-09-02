import { Router } from 'express';

import CharactersController from '../controllers/CharactersController';
import CHARACTER_COLUMNS from '@modules/characters/entities/characterColumns';
import {
  validateListQuery,
  validatePositiveIntegerParam,
  validateQuery,
} from '@shared/infra/http/requestValidation';

const charactersRouter = Router();
const charactersController = new CharactersController();

charactersRouter.get(
  '/',
  validateListQuery({
    allowList: CHARACTER_COLUMNS,
    fields: ['continuity', 'multiverse_designation'],
  }),
  charactersController.index,
);
charactersRouter.get(
  '/movie/:movie_id',
  validatePositiveIntegerParam('movie_id'),
  validateQuery(),
  charactersController.getByMovie,
);
charactersRouter.get(
  '/tvshow/:tvshow_id',
  validatePositiveIntegerParam('tvshow_id'),
  validateQuery(),
  charactersController.getByTVShow,
);
charactersRouter.get(
  '/:character_id/movies',
  validatePositiveIntegerParam('character_id'),
  validateQuery(),
  charactersController.getMovies,
);
charactersRouter.get(
  '/:character_id/tvshows',
  validatePositiveIntegerParam('character_id'),
  validateQuery(),
  charactersController.getTVShows,
);
charactersRouter.get(
  '/:character_id',
  validatePositiveIntegerParam('character_id'),
  validateQuery(),
  charactersController.show,
);

export default charactersRouter;
