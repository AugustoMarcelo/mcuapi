import { NextFunction, Request, Response } from 'express';

import { getRedisClient } from './redis';

export const METRICS_RETENTION_SECONDS = 90 * 24 * 60 * 60;

const KEY_SEP = '\u0000';

export function today(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function routePattern(request: Request): string {
  const matched = Boolean(
    (request as Request & { route?: { path?: string } }).route?.path,
  );
  const path = (request.originalUrl || '/').split('?')[0];

  if (!matched) {
    if (path === '/docs' || path.startsWith('/docs/')) return '/docs/*';
    return '<unmatched>';
  }

  return normaliseRoutePath(path);
}

export function normaliseRoutePath(path: string): string {
  const normalised = path
    .split('/')
    .map(segment => (/^\d+$/.test(segment) ? ':id' : segment))
    .join('/');
  const trimmed =
    normalised.length > 1 && normalised.endsWith('/')
      ? normalised.slice(0, -1)
      : normalised;

  return trimmed.slice(0, 120) || '/';
}

export function statusClass(status: number): number {
  return Math.floor(status / 100);
}

export async function record(
  day: string,
  route: string,
  status: number,
): Promise<void> {
  const client = getRedisClient();

  if (!client) return;

  const key = `mcuapi:metrics:${day}`;
  const field = [route, statusClass(status)].join(KEY_SEP);

  try {
    await client.hIncrBy(key, field, 1);
    await client.expire(key, METRICS_RETENTION_SECONDS);
  } catch {
    return;
  }
}

export function metricsMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  response.on('finish', () => {
    const route =
      typeof response.locals.metricsRoute === 'string'
        ? response.locals.metricsRoute
        : routePattern(request);
    void record(today(), route, response.statusCode);
  });

  next();
}
