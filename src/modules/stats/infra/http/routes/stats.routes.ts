import { Router } from 'express';

import StatsController from '../controllers/StatsController';
import { validateQuery } from '@shared/infra/http/requestValidation';

const statsRouter = Router();
const statsController = new StatsController();

statsRouter.get('/', validateQuery(), statsController.index);

export default statsRouter;
