import express, { Request, Response } from 'express';
import request from 'supertest';

import { cacheApiResponse } from './cache';
import { getRedisClient } from './redis';

jest.mock('./redis', () => ({ getRedisClient: jest.fn() }));

const mockGetRedisClient = getRedisClient as jest.Mock;

describe('cacheApiResponse', () => {
  function makeApp() {
    const app = express();
    app.use(cacheApiResponse);
    app.get('/api/v1/movies', (request_: Request, response: Response) =>
      response.json({ query: request_.originalUrl }),
    );
    app.get('/health/live', (_request: Request, response: Response) =>
      response.json({ status: 'ok' }),
    );
    return app;
  }

  beforeEach(() => {
    mockGetRedisClient.mockReset();
  });

  it('Should return a cached API response without running the route', async () => {
    const get = jest
      .fn()
      .mockImplementation(key =>
        key === 'mcuapi:cache:generation'
          ? Promise.resolve(null)
          : Promise.resolve(JSON.stringify({ cached: true })),
      );
    mockGetRedisClient.mockReturnValue({ get });

    const response = await request(makeApp()).get('/api/v1/movies?limit=1');

    expect(response.body).toEqual({ cached: true });
    expect(response.headers['x-cache']).toBe('HIT');
    expect(get).toHaveBeenLastCalledWith(
      'mcuapi:response:0:/api/v1/movies?limit=1',
    );
  });

  it('Should cache distinct query strings under distinct keys', async () => {
    const get = jest.fn().mockResolvedValue(null);
    const set = jest.fn().mockResolvedValue('OK');
    mockGetRedisClient.mockReturnValue({ get, set });

    await request(makeApp()).get('/api/v1/movies?limit=1');
    await request(makeApp()).get('/api/v1/movies?limit=2');

    expect(set).toHaveBeenNthCalledWith(
      1,
      'mcuapi:response:0:/api/v1/movies?limit=1',
      JSON.stringify({ query: '/api/v1/movies?limit=1' }),
      { expiration: { type: 'EX', value: 86_400 } },
    );
    expect(set).toHaveBeenNthCalledWith(
      2,
      'mcuapi:response:0:/api/v1/movies?limit=2',
      JSON.stringify({ query: '/api/v1/movies?limit=2' }),
      { expiration: { type: 'EX', value: 86_400 } },
    );
  });

  it('Should serve a live response when Redis is unavailable', async () => {
    mockGetRedisClient.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('down')),
    });

    const response = await request(makeApp()).get('/api/v1/movies');

    expect(response.body).toEqual({ query: '/api/v1/movies' });
    expect(response.headers['x-cache']).toBeUndefined();
  });

  it('Should not cache health responses', async () => {
    const get = jest.fn();
    mockGetRedisClient.mockReturnValue({ get });

    const response = await request(makeApp()).get('/health/live');

    expect(response.body).toEqual({ status: 'ok' });
    expect(get).not.toHaveBeenCalled();
  });
});
