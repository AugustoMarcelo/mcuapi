import 'reflect-metadata';
import 'dotenv/config';

import app from './app';
import {
  connectRateLimitStore,
  disconnectRateLimitStore,
} from './rateLimitStore';
import { nextDatabaseAttempt } from './databaseRetry';
import { initializeDataSource } from '@shared/infra/typeorm';

const port = process.env.PORT || 3333;
const DATABASE_CONNECTION_ATTEMPTS = 5;
const DATABASE_RETRY_DELAY_MS = 5_000;

async function start(): Promise<void> {
  assertProductionConfiguration();
  await connectRateLimitStore();

  app.listen(port, () => {
    // eslint-disable-next-line no-console -- boot banner; confirms the server is up
    console.log(`🦸‍♂️ api running on port ${port}`);
  });

  installRateLimitStoreShutdownHook();
  void initializeDatabaseWithRetry({ attempt: 1 });
}

function assertProductionConfiguration(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is required in production');
  }
}

export async function initializeDatabaseWithRetry({
  attempt,
}: {
  attempt: number;
}): Promise<void> {
  try {
    await initializeDataSource();
    return;
  } catch (error) {
    process.stderr.write(
      `database initialization attempt ${attempt} failed: ${String(error)}\n`,
    );
  }

  if (attempt === DATABASE_CONNECTION_ATTEMPTS) {
    process.stderr.write(
      'database remains unavailable; serving liveness only\n',
    );
  }

  setTimeout(() => {
    void initializeDatabaseWithRetry({
      attempt: nextDatabaseAttempt({ attempt }),
    });
  }, DATABASE_RETRY_DELAY_MS);
}

function installRateLimitStoreShutdownHook(): void {
  const close = () => {
    void disconnectRateLimitStore();
  };

  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

if (process.env.NODE_ENV !== 'test') {
  void start().catch(error => {
    process.stderr.write(`server startup failed: ${String(error)}\n`);
    process.exitCode = 1;
    process.exit();
  });
}
