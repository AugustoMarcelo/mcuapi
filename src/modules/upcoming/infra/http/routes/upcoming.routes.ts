import { Router } from 'express';

import UpcomingController from '../controllers/UpcomingController';

const upcomingRouter = Router();
const upcomingController = new UpcomingController();

upcomingRouter.get('/', upcomingController.index);

export default upcomingRouter;
