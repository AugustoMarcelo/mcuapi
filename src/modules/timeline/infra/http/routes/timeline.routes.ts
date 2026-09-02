import { Router } from 'express';

import TimelineController from '../controllers/TimelineController';
import { validateListQuery } from '@shared/infra/http/requestValidation';

const timelineRouter = Router();
const timelineController = new TimelineController();

timelineRouter.get(
  '/',
  validateListQuery({ fields: ['multiverse'], allowPagination: false }),
  timelineController.index,
);

export default timelineRouter;
