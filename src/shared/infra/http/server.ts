import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import AppError from '@shared/errors/AppError';
import swaggerFile from '@config/swagger.json';
import routes from './routes';
import healthRouter from './routes/health.routes';
import '@shared/infra/typeorm';
import '@shared/container';

// The dataset changes a handful of times a month, so responses are safe to
// cache for an hour. Express already emits a weak ETag and answers
// If-None-Match with a 304 — this lets clients and CDNs skip that round trip
// entirely instead of revalidating on every request.
const CACHE_MAX_AGE_SECONDS = 60 * 60;

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(cors());
app.use(express.json() as express.RequestHandler);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      status: 'Error',
      statusCode: 429,
      message: 'Too many requests, please try again in a minute.',
    },
  }),
);

app.use('/health', healthRouter);
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

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  console.error(err);
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'Error',
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  return response.status(500).json({
    status: 'Error',
    statusCode: 500,
    message: 'Internal server error',
  });
});

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`🦸‍♂️ api running on port ${port}`);
});
