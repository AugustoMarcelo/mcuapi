import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import routes from './routes';
import healthRouter from './routes/health.routes';
import { metricsMiddleware } from './metrics';
import { sendProblem } from './problem';
import { createRateLimitStore } from './rateLimitStore';
import { resolveTrustedProxyCidrs } from './trustedProxy';
import swaggerUI from 'swagger-ui-express';
import swaggerFile from '@config/swagger.json';
import AppError from '@shared/errors/AppError';
import '@shared/container';

// The dataset changes a handful of times a month, so responses are safe to
// cache for an hour. Express already emits a weak ETag and answers
// If-None-Match with a 304 — this lets clients and CDNs skip that round trip
// entirely instead of revalidating on every request.
const CACHE_MAX_AGE_SECONDS = 60 * 60;

const app = express();

app.set('trust proxy', resolveTrustedProxyCidrs());
app.disable('x-powered-by');

app.use(cors());
app.use(express.json());

// Before the rate limiter, so throttled requests are counted too — a spike of
// 429s is exactly the kind of thing worth seeing.
app.use(metricsMiddleware);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: createRateLimitStore(),
    handler: (request, response) =>
      sendProblem({
        request,
        response,
        status: 429,
        detail: 'Too many requests, please try again in a minute.',
      }),
  }),
);

app.use('/health', healthRouter);

// Registered before the /docs mount so swagger-ui-express's catch-all setup
// middleware — which renders the HTML page for any /docs/* path — never
// swallows this request.
app.get('/docs/openapi.json', (request: Request, response: Response) => {
  response.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}`);
  return response.json(swaggerFile);
});
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));

app.use((request: Request, response: Response, next: NextFunction) => {
  // HEAD must carry the same caching headers as GET — `curl -I` is how most
  // people check a cache policy, and omitting it there reads as "not cached".
  if (request.method === 'GET' || request.method === 'HEAD') {
    response.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}`);
  }

  return next();
});

app.use(routes);

app.use((request: Request, response: Response) => {
  return sendProblem({
    request,
    response,
    status: 404,
    detail: 'Route not found',
  });
});

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return sendProblem({
      request,
      response,
      status: err.statusCode,
      detail: err.message,
    });
  }

  if (err instanceof SyntaxError && isBadJsonError(err)) {
    return sendProblem({
      request,
      response,
      status: 400,
      detail: 'Malformed JSON request body',
    });
  }

  process.stderr.write(`${err.stack ?? err.message}\n`);

  return sendProblem({
    request,
    response,
    status: 500,
    detail: 'Internal server error',
  });
});

function isBadJsonError(error: Error): boolean {
  return (error as Error & { status?: unknown }).status === 400;
}

export default app;
