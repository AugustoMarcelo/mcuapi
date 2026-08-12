import { Request, Response, Router } from 'express';

import AppDataSource from '@shared/infra/typeorm/dataSource';

const healthRouter = Router();

healthRouter.get('/', async (_request: Request, response: Response) => {
  let database = 'down';

  try {
    await AppDataSource.query('SELECT 1');
    database = 'up';
  } catch {
    database = 'down';
  }

  const status = database === 'up' ? 200 : 503;

  return response.status(status).json({
    status: status === 200 ? 'ok' : 'degraded',
    version: process.env.npm_package_version || null,
    uptime: Math.floor(process.uptime()),
    database,
  });
});

export default healthRouter;
