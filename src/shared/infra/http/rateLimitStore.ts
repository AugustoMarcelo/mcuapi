import { RedisStore } from 'rate-limit-redis';

import { connectRedis, disconnectRedis, getRedisClient } from './redis';

export function createRateLimitStore(): RedisStore | undefined {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return undefined;
  }

  return new RedisStore({
    sendCommand: async (...command: string[]) => {
      await connectRedis();
      return redisClient.sendCommand(command);
    },
  });
}

export async function connectRateLimitStore(): Promise<void> {
  await connectRedis();
}

export async function disconnectRateLimitStore(): Promise<void> {
  await disconnectRedis();
}
