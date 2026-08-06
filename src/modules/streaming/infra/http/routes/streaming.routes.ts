import { Router } from 'express';

import StreamingController from '../controllers/StreamingController';

const streamingRouter = Router();
const streamingController = new StreamingController();

streamingRouter.get('/providers', streamingController.providers);

export default streamingRouter;
