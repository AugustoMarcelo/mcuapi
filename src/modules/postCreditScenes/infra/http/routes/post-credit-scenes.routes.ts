import { Router } from 'express';

import PostCreditScenesController from '../controllers/PostCreditScenesController';

const postCreditScenesRouter = Router();
const postCreditScenesController = new PostCreditScenesController();

postCreditScenesRouter.get('/', postCreditScenesController.index);
postCreditScenesRouter.get(
  '/movie/:movie_id',
  postCreditScenesController.getByMovie,
);
postCreditScenesRouter.get(
  '/tvshow/:tvshow_id',
  postCreditScenesController.getByTVShow,
);
postCreditScenesRouter.get(
  '/:post_credit_scene_id',
  postCreditScenesController.show,
);

export default postCreditScenesRouter;
