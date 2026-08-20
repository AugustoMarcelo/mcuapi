import 'reflect-metadata';
import 'dotenv/config';

import app from './app';
import { installMetricsShutdownHooks, startMetricsFlusher } from './metrics';
import dataSourceInitialization from '@shared/infra/typeorm';

const port = process.env.PORT || 3333;

// Listening doesn't wait on the database, so a Neon outage (e.g. an exhausted
// free-plan compute-hour quota) only fails DB-backed routes instead of taking
// down /health/live along with the whole process.
app.listen(port, () => {
  // eslint-disable-next-line no-console -- boot banner; confirms the server is up
  console.log(`🦸‍♂️ api running on port ${port}`);
  startMetricsFlusher();
  installMetricsShutdownHooks();
});

dataSourceInitialization.catch(err => {
  // eslint-disable-next-line no-console -- DB init failure; server stays up, but this needs to be visible
  console.error('failed to initialize the database connection', err);
});
