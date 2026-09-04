import { Request } from 'express';

import { getRedisClient } from './redis';

jest.mock('./redis', () => ({ getRedisClient: jest.fn() }));

import {
  METRICS_RETENTION_SECONDS,
  record,
  routePattern,
  statusClass,
  today,
} from './metrics';

const mockGetRedisClient = getRedisClient as jest.Mock;

const req = (originalUrl: string, matched = true): Request =>
  ({
    originalUrl,
    baseUrl: '',
    route: matched ? { path: '/ignored' } : undefined,
  }) as unknown as Request;

describe('today', () => {
  it('Should format as YYYY-MM-DD in UTC', () => {
    expect(today(new Date('2026-08-05T23:59:00Z'))).toBe('2026-08-05');
  });
});

describe('routePattern', () => {
  it('Should replace numeric ids and drop query strings', () => {
    expect(routePattern(req('/api/v1/movies/1?limit=5'))).toBe(
      '/api/v1/movies/:id',
    );
  });

  it('Should bucket unmatched requests together', () => {
    expect(routePattern(req('/wp-admin', false))).toBe('<unmatched>');
  });
});

describe('statusClass', () => {
  it('Should reduce a status to its leading digit', () => {
    expect(statusClass(200)).toBe(2);
    expect(statusClass(404)).toBe(4);
  });
});

describe('record', () => {
  beforeEach(() => {
    mockGetRedisClient.mockReset();
  });

  it('Should increment a daily Redis counter and renew its 90-day expiry', async () => {
    const hIncrBy = jest.fn().mockResolvedValue(1);
    const expire = jest.fn().mockResolvedValue(1);
    mockGetRedisClient.mockReturnValue({ hIncrBy, expire });

    await record('2026-08-05', '/api/v1/movies', 200);

    expect(hIncrBy).toHaveBeenCalledWith(
      'mcuapi:metrics:2026-08-05',
      '/api/v1/movies\u00002',
      1,
    );
    expect(expire).toHaveBeenCalledWith(
      'mcuapi:metrics:2026-08-05',
      METRICS_RETENTION_SECONDS,
    );
  });

  it('Should ignore an unavailable Redis client', async () => {
    mockGetRedisClient.mockReturnValue(undefined);

    await expect(
      record('2026-08-05', '/api/v1/movies', 200),
    ).resolves.toBeUndefined();
  });

  it('Should ignore a Redis write failure', async () => {
    mockGetRedisClient.mockReturnValue({
      hIncrBy: jest.fn().mockRejectedValue(new Error('down')),
      expire: jest.fn(),
    });

    await expect(
      record('2026-08-05', '/api/v1/movies', 200),
    ).resolves.toBeUndefined();
  });
});
