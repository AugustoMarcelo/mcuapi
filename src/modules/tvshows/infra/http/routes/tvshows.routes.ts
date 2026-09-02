import { Router } from 'express';
import TVShowsController from '@modules/tvshows/infra/http/controllers/TVShowsController';
import TVSHOW_COLUMNS from '@modules/tvshows/entities/tvshowColumns';
import {
  validateListQuery,
  validatePositiveIntegerParam,
  validateQuery,
} from '@shared/infra/http/requestValidation';

const tvshowsRouter = Router();
const tvShowsControler = new TVShowsController();

tvshowsRouter.get(
  '/',
  validateListQuery({
    allowList: TVSHOW_COLUMNS,
    fields: ['studio', 'continuity', 'multiverse_designation'],
    allowBoolean: true,
  }),
  tvShowsControler.index,
);
tvshowsRouter.get(
  '/:tvshow_id',
  validatePositiveIntegerParam('tvshow_id'),
  validateQuery(),
  tvShowsControler.show,
);

export default tvshowsRouter;
