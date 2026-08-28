import { Router } from 'express';

import TitlesController from '../controllers/TitlesController';
import TITLE_COLUMNS from '@modules/titles/entities/titleColumns';
import { validateListQuery } from '@shared/infra/http/requestValidation';

const titlesRouter = Router();
const titlesController = new TitlesController();

titlesRouter.get(
  '/',
  validateListQuery({
    allowList: TITLE_COLUMNS,
    fields: ['studio', 'continuity', 'multiverse_designation'],
    allowBoolean: true,
    allowType: true,
  }),
  titlesController.index,
);

export default titlesRouter;
