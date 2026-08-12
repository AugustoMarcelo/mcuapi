import 'reflect-metadata';
import 'dotenv/config';

import app from './app';
import { installMetricsShutdownHooks, startMetricsFlusher } from './metrics';
import dataSourceInitialization from '@shared/infra/typeorm';

const port = process.env.PORT || 3333;

dataSourceInitialization
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console -- boot banner; confirms the server is up
      console.log(`🦸‍♂️ api running on port ${port}`);
      startMetricsFlusher();
      installMetricsShutdownHooks();
    });
  })
  .catch(err => {
    // eslint-disable-next-line no-console -- fatal boot failure; nothing else can report it
    console.error('failed to initialize the database connection', err);
    process.exit(1);
  });
