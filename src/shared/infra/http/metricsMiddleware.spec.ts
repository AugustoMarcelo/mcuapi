import http from 'http';
import express, { NextFunction, Request, Response, Router } from 'express';
import 'express-async-errors';

import { drain, metricsMiddleware } from './metrics';
import AppError from '@shared/errors/AppError';

/**
 * Exercises the middleware against an app shaped like the real one: nested
 * routers, async handlers, `express-async-errors`, and services that signal
 * "not found" by throwing `AppError` rather than returning a response.
 *
 * That last detail is the whole point. A thrown AppError unwinds the router
 * stack via next(err) before the app-level error handler responds, and Express
 * restores `req.baseUrl` to '' on the way out. An earlier implementation read
 * `req.baseUrl` + `req.route.path` at response time and recorded a 404 on
 * /api/v1/movies/9 as `/:movie_id`, while a 200 on the identical route
 * recorded correctly. A test with a synchronous handler that returns its own
 * 404 does not reproduce it.
 */
describe('metricsMiddleware (app shaped like the real one)', () => {
  let server: http.Server;
  let base: string;

  beforeAll(done => {
    const app = express();
    app.use(metricsMiddleware);

    const movies = Router();
    movies.get('/', async (_req, res) => {
      res.json([]);
    });
    movies.get('/:movie_id', async (req, res) => {
      // stand-in for the repository round trip
      await new Promise(resolve => {
        setTimeout(resolve, 1);
      });
      // this is what ShowMovieService really does
      if (req.params.movie_id === '99999999') {
        throw new AppError('Movie not found', 404);
      }
      res.json({ id: Number(req.params.movie_id) });
    });

    // mirrors app.use(routes) -> routes.use('/api/v1/movies', moviesRouter)
    const routes = Router();
    routes.use('/api/v1/movies', movies);
    app.use(routes);

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    });

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
    drain();
  });

  const get = (path: string) =>
    new Promise<number>(resolve => {
      http.get(`${base}${path}`, res => {
        res.resume();
        res.on('end', () => resolve(res.statusCode ?? 0));
      });
    });

  it('Should label a successful show request by its route shape', async () => {
    expect(await get('/api/v1/movies/1')).toBe(200);

    const rows = drain();
    expect(rows).toHaveLength(1);
    expect(rows[0].route).toBe('/api/v1/movies/:id');
    expect(rows[0].status_class).toBe(2);
  });

  it('Should label a thrown 404 identically to a 200 on the same route', async () => {
    expect(await get('/api/v1/movies/99999999')).toBe(404);

    const rows = drain();
    expect(rows).toHaveLength(1);
    // the regression: this used to be recorded as '/:movie_id'
    expect(rows[0].route).toBe('/api/v1/movies/:id');
    expect(rows[0].status_class).toBe(4);
  });

  it('Should put a 200 and a thrown 404 on the same route in one bucket', async () => {
    await get('/api/v1/movies/1');
    await get('/api/v1/movies/99999999');

    const routes = drain().map(row => row.route);
    expect(new Set(routes).size).toBe(1);
    expect(routes[0]).toBe('/api/v1/movies/:id');
  });

  it('Should label a collection route without a placeholder', async () => {
    await get('/api/v1/movies');

    expect(drain()[0].route).toBe('/api/v1/movies');
  });

  it('Should drop the query string from a collection route', async () => {
    await get('/api/v1/movies?limit=5&page=2');

    expect(drain()[0].route).toBe('/api/v1/movies');
  });

  it('Should bucket a path that matched no route', async () => {
    await get('/nothing/here');

    const rows = drain();
    expect(rows[0].route).toBe('<unmatched>');
    expect(rows[0].status_class).toBe(4);
  });

  it('Should never record a concrete id', async () => {
    await get('/api/v1/movies/12345');

    expect(drain()[0].route).not.toContain('12345');
  });

  it('Should aggregate repeated hits and count each response once', async () => {
    await get('/api/v1/movies/1');
    await get('/api/v1/movies/2');
    await get('/api/v1/movies/3');

    const rows = drain();
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(3);
  });
});
