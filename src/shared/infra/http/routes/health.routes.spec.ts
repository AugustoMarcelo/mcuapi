import express from 'express';
import request from 'supertest';
import { getConnection } from 'typeorm';

import healthRouter from './health.routes';

jest.mock('typeorm', () => ({
  getConnection: jest.fn(),
}));

function makeApp() {
  const app = express();
  app.use('/health', healthRouter);
  return app;
}

describe('health.routes', () => {
  it('Should return 200 with database up when the connection query succeeds', async () => {
    (getConnection as jest.Mock).mockReturnValue({
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    });

    const response = await request(makeApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', database: 'up' });
    expect(typeof response.body.uptime).toBe('number');
  });

  it('Should return 503 with database down when the connection query throws', async () => {
    (getConnection as jest.Mock).mockReturnValue({
      query: jest.fn().mockRejectedValue(new Error('connection refused')),
    });

    const response = await request(makeApp()).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: 'degraded',
      database: 'down',
    });
  });
});
