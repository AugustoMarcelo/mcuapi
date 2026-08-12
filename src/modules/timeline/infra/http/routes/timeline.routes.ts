import { Router } from 'express';

import TimelineController from '../controllers/TimelineController';

const timelineRouter = Router();
const timelineController = new TimelineController();

timelineRouter.get('/', timelineController.index);

export default timelineRouter;
