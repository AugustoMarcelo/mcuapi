import { Request, Response, Router } from 'express';

import { sendProblem } from '../problem';
import AppDataSource from '@shared/infra/typeorm/dataSource';

const healthRouter = Router();

// No DB check: Railway polls this continuously, and a query here would keep
// a scale-to-zero Neon compute permanently awake, burning free-tier compute-hours.
healthRouter.get('/live', (_request: Request, response: Response) => {
  return response.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
  });
});

healthRouter.get('/', async (request: Request, response: Response) => {
  try {
    await AppDataSource.query('SELECT 1');
  } catch {
    return sendProblem({
      request,
      response,
      status: 503,
      detail: 'Database is unavailable',
    });
  }

  return response.status(200).json({
    status: 'ok',
    version: process.env.npm_package_version || null,
    uptime: Math.floor(process.uptime()),
    database: 'up',
  });
});

export default healthRouter;
