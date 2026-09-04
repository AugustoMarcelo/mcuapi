import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | undefined;
let connection: Promise<unknown> | undefined;

export function getRedisClient(): RedisClient | undefined {
  const url = process.env.REDIS_URL;

  if (process.env.NODE_ENV !== 'production' || !url) {
    return undefined;
  }

  if (client) {
    return client;
  }

  client = createClient({ url, disableOfflineQueue: true });
  client.on('error', error => {
    process.stderr.write(`redis error: ${error.message}\n`);
  });
  connection = client.connect();

  return client;
}

export async function connectRedis(): Promise<void> {
  getRedisClient();
  await connection;
}

export async function disconnectRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
  }

  client = undefined;
  connection = undefined;
}
