import { Router } from 'express';

import PostCreditScenesController from '../controllers/PostCreditScenesController';
import POST_CREDIT_SCENE_COLUMNS from '@modules/postCreditScenes/entities/postCreditSceneColumns';
import {
  validateListQuery,
  validatePositiveIntegerParam,
  validateQuery,
} from '@shared/infra/http/requestValidation';

const postCreditScenesRouter = Router();
const postCreditScenesController = new PostCreditScenesController();

postCreditScenesRouter.get(
  '/',
  validateListQuery({ allowList: POST_CREDIT_SCENE_COLUMNS }),
  postCreditScenesController.index,
);
postCreditScenesRouter.get(
  '/movie/:movie_id',
  validatePositiveIntegerParam('movie_id'),
  validateQuery(),
  postCreditScenesController.getByMovie,
);
postCreditScenesRouter.get(
  '/tvshow/:tvshow_id',
  validatePositiveIntegerParam('tvshow_id'),
  validateQuery(),
  postCreditScenesController.getByTVShow,
);
postCreditScenesRouter.get(
  '/:post_credit_scene_id',
  validatePositiveIntegerParam('post_credit_scene_id'),
  validateQuery(),
  postCreditScenesController.show,
);

export default postCreditScenesRouter;
