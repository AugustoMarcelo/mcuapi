import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';
import 'express-async-errors';

import AppError from '@shared/errors/AppError';
import swaggerFile from '@config/swagger.json';
import routes from './routes';
import '@shared/infra/typeorm';
import '@shared/container';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));
app.use(routes);

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'Error',
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.listen(process.env.PORT || 3333, () => {
  console.log('🦸‍♂️ api running on port 3333');
});
