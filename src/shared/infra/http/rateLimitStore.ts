import { createClient } from 'redis';
import { RedisStore } from 'rate-limit-redis';

let client: ReturnType<typeof createClient> | undefined;
let connection: Promise<unknown> | undefined;

export function createRateLimitStore(): RedisStore | undefined {
  const url = process.env.REDIS_URL;

  if (process.env.NODE_ENV !== 'production' || !url) {
    return undefined;
  }

  const redisClient = createClient({ url });
  client = redisClient;
  connection = redisClient.connect();
  redisClient.on('error', error => {
    process.stderr.write(`rate limit store error: ${error.message}\n`);
  });

  return new RedisStore({
    sendCommand: (...command: string[]) => redisClient.sendCommand(command),
  });
}

export async function connectRateLimitStore(): Promise<void> {
  if (connection) {
    await connection;
  }
}

export async function disconnectRateLimitStore(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
  }

  connection = undefined;
}
