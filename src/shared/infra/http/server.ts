import 'reflect-metadata';
import 'dotenv/config';
import '@shared/infra/typeorm';

import app from './app';
import { installMetricsShutdownHooks, startMetricsFlusher } from './metrics';

const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`🦸‍♂️ api running on port ${port}`);
  startMetricsFlusher();
  installMetricsShutdownHooks();
});
