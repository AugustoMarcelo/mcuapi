import http from 'http';
import express, { NextFunction, Request, Response, Router } from 'express';

import { getRedisClient } from './redis';

jest.mock('./redis', () => ({ getRedisClient: jest.fn() }));

import { metricsMiddleware } from './metrics';
import AppError from '@shared/errors/AppError';

const mockGetRedisClient = getRedisClient as jest.Mock;

describe('metricsMiddleware', () => {
  let server: http.Server;
  let base: string;
  let hIncrBy: jest.Mock;

  beforeAll(done => {
    const app = express();
    app.use(metricsMiddleware);
    const movies = Router();
    movies.get('/cached/:movie_id', (request_, response) => {
      response.locals.metricsRoute = '/api/v1/movies/:id';
      response.json({ id: Number(request_.params.movie_id) });
    });
    movies.get('/:movie_id', async (request_, response) => {
      if (request_.params.movie_id === '99999999') {
        throw new AppError('Movie not found', 404);
      }
      response.json({ id: Number(request_.params.movie_id) });
    });
    const routes = Router();
    routes.use('/api/v1/movies', movies);
    app.use(routes);
    app.use(
      (
        error: Error,
        _request: Request,
        response: Response,
        _: NextFunction,
      ) => {
        response
          .status(error instanceof AppError ? error.statusCode : 500)
          .json({});
      },
    );
    server = app.listen(0, () => {
      const { port } = server.address() as { port: number };
      base = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll(done => {
    server.close(() => done());
  });

  beforeEach(() => {
    hIncrBy = jest.fn().mockResolvedValue(1);
    mockGetRedisClient.mockReturnValue({
      hIncrBy,
      expire: jest.fn().mockResolvedValue(1),
    });
  });

  const get = (path: string) =>
    new Promise<number>(resolve => {
      http.get(`${base}${path}`, response => {
        response.resume();
        response.on('end', () => resolve(response.statusCode ?? 0));
      });
    });

  it('Should record a successful request under its route shape', async () => {
    expect(await get('/api/v1/movies/1')).toBe(200);
    await new Promise(resolve => setImmediate(resolve));

    expect(hIncrBy).toHaveBeenCalledWith(
      expect.stringMatching(/^mcuapi:metrics:/),
      '/api/v1/movies/:id\u00002',
      1,
    );
  });

  it('Should record a thrown error with the same route shape and error class', async () => {
    expect(await get('/api/v1/movies/99999999')).toBe(404);
    await new Promise(resolve => setImmediate(resolve));

    expect(hIncrBy).toHaveBeenCalledWith(
      expect.stringMatching(/^mcuapi:metrics:/),
      '/api/v1/movies/:id\u00004',
      1,
    );
  });

  it('Should preserve the route label supplied by a response cache hit', async () => {
    expect(await get('/api/v1/movies/cached/1')).toBe(200);
    await new Promise(resolve => setImmediate(resolve));

    expect(hIncrBy).toHaveBeenCalledWith(
      expect.stringMatching(/^mcuapi:metrics:/),
      '/api/v1/movies/:id\u00002',
      1,
    );
  });
});
