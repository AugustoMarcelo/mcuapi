import { Router } from 'express';

import TitlesController from '../controllers/TitlesController';

const titlesRouter = Router();
const titlesController = new TitlesController();

titlesRouter.get('/', titlesController.index);

export default titlesRouter;
