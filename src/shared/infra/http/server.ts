import 'reflect-metadata';
import 'dotenv/config';
import '@shared/infra/typeorm';

import app from './app';
import { installMetricsShutdownHooks, startMetricsFlusher } from './metrics';

const port = process.env.PORT || 3333;

app.listen(port, () => {
  // eslint-disable-next-line no-console -- boot banner; confirms the server is up
  console.log(`🦸‍♂️ api running on port ${port}`);
  startMetricsFlusher();
  installMetricsShutdownHooks();
});
