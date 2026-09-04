import { NextFunction, Request, Response } from 'express';

import { getRedisClient } from './redis';
import { normaliseRoutePath } from './metrics';

const CACHE_TTL_SECONDS = 86_400;
const CACHE_GENERATION_KEY = 'mcuapi:cache:generation';
const CACHE_RESPONSE_PREFIX = 'mcuapi:response';

export async function cacheApiResponse(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  if (!request.path.startsWith('/api/v1/')) {
    next();
    return;
  }

  const client = getRedisClient();

  if (!client) {
    next();
    return;
  }

  try {
    const generation = (await client.get(CACHE_GENERATION_KEY)) ?? '0';
    const key = `${CACHE_RESPONSE_PREFIX}:${generation}:${request.originalUrl}`;
    const cached = await client.get(key);

    if (cached !== null) {
      response.locals.metricsRoute = normaliseRoutePath(request.path);
      response.set('Content-Type', 'application/json; charset=utf-8');
      response.set('X-Cache', 'HIT');
      response.send(cached);
      return;
    }

    cacheJsonResponse({ client, key, response });
  } catch {
    next();
    return;
  }

  next();
}

function cacheJsonResponse({
  client,
  key,
  response,
}: {
  client: NonNullable<ReturnType<typeof getRedisClient>>;
  key: string;
  response: Response;
}): void {
  const json = response.json.bind(response);

  response.json = body => {
    if (response.statusCode === 200) {
      const serialized = JSON.stringify(body);

      if (serialized !== undefined) {
        void client
          .set(key, serialized, {
            expiration: { type: 'EX', value: CACHE_TTL_SECONDS },
          })
          .catch(() => undefined);
      }
    }

    return json(body);
  };
}
