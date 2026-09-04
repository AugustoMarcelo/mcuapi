import { createClient } from 'redis';

const CACHE_GENERATION_KEY = 'mcuapi:cache:generation';
const METRIC_KEY_PREFIX = 'mcuapi:metrics';
const KEY_SEP = '\u0000';

type RedisClient = ReturnType<typeof createClient>;

export interface UsageMetric {
  day: string;
  route: string;
  statusClass: number;
  count: number;
}

let client: RedisClient | undefined;
let connection: Promise<unknown> | undefined;

async function getRedisClient(): Promise<RedisClient | undefined> {
  const url = process.env.REDIS_URL;

  if (!url) return undefined;

  if (!client) {
    client = createClient({ url, disableOfflineQueue: true });
    client.on('error', error => {
      process.stderr.write(`redis error: ${error.message}\n`);
    });
    connection = client.connect();
  }

  try {
    await connection;
    return client;
  } catch {
    client = undefined;
    connection = undefined;
    return undefined;
  }
}

export async function invalidateApiCache(): Promise<void> {
  const redis = await getRedisClient();

  if (!redis) return;

  try {
    await redis.incr(CACHE_GENERATION_KEY);
  } catch {
    return;
  }
}

export async function readUsageMetrics({
  days,
}: {
  days: number;
}): Promise<UsageMetric[]> {
  const redis = await getRedisClient();

  if (!redis) return [];

  const metrics: UsageMetric[] = [];
  const now = new Date();

  try {
    for (let offset = 0; offset < days; offset += 1) {
      const day = new Date(now);
      day.setUTCDate(now.getUTCDate() - offset);
      const date = day.toISOString().slice(0, 10);
      const values = await redis.hGetAll(`${METRIC_KEY_PREFIX}:${date}`);

      Object.entries(values).forEach(([field, value]) => {
        const [route, statusClass] = field.split(KEY_SEP);
        const count = Number(value);

        if (
          !route ||
          !Number.isInteger(Number(statusClass)) ||
          !Number.isFinite(count)
        ) {
          return;
        }

        metrics.push({
          day: date,
          route,
          statusClass: Number(statusClass),
          count,
        });
      });
    }
  } catch {
    return [];
  }

  return metrics;
}
