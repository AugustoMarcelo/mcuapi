import express from 'express';
import request from 'supertest';

import healthRouter from './health.routes';
import AppDataSource from '@shared/infra/typeorm/dataSource';

jest.mock('@shared/infra/typeorm/dataSource', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

function makeApp() {
  const app = express();
  app.use('/health', healthRouter);
  return app;
}

describe('health.routes', () => {
  it('Should return 200 without querying the database on /live', async () => {
    const response = await request(makeApp()).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
    expect(typeof response.body.uptime).toBe('number');
    expect(AppDataSource.query).not.toHaveBeenCalled();
  });

  it('Should return 200 with database up when the connection query succeeds', async () => {
    (AppDataSource.query as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

    const response = await request(makeApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', database: 'up' });
    expect(typeof response.body.uptime).toBe('number');
  });

  it('Should return 503 with database down when the connection query throws', async () => {
    (AppDataSource.query as jest.Mock).mockRejectedValue(
      new Error('connection refused'),
    );

    const response = await request(makeApp()).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: 'degraded',
      database: 'down',
    });
  });
});
