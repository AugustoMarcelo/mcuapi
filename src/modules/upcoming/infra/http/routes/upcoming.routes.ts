import { Router } from 'express';

import UpcomingController from '../controllers/UpcomingController';
import { validateListQuery } from '@shared/infra/http/requestValidation';

const upcomingRouter = Router();
const upcomingController = new UpcomingController();

upcomingRouter.get(
  '/',
  validateListQuery({
    fields: ['continuity', 'multiverse_designation'],
    allowBoolean: true,
    allowType: true,
  }),
  upcomingController.index,
);

export default upcomingRouter;
