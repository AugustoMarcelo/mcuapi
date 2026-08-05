import { Request } from 'express';

import {
  MAX_BUFFER_KEYS,
  buildUpsert,
  bufferSize,
  drain,
  record,
  routePattern,
  statusClass,
  today,
} from './metrics';

const req = (originalUrl: string, matched = true): Request =>
  ({
    originalUrl,
    baseUrl: '',
    route: matched ? { path: '/ignored' } : undefined,
  } as unknown as Request);

describe('today', () => {
  it('Should format as YYYY-MM-DD in UTC', () => {
    expect(today(new Date('2026-08-05T23:59:00Z'))).toBe('2026-08-05');
  });

  it('Should not shift the day for a local timezone offset', () => {
    // 00:30 UTC is still the previous evening in the Americas; the counter
    // must key on the UTC day so a redeploy elsewhere cannot split a bucket.
    expect(today(new Date('2026-08-06T00:30:00Z'))).toBe('2026-08-06');
  });
});

describe('routePattern', () => {
  it('Should replace a numeric id with a placeholder', () => {
    expect(routePattern(req('/api/v1/movies/1'))).toBe('/api/v1/movies/:id');
  });

  it('Should replace every numeric segment, not just the last', () => {
    expect(routePattern(req('/api/v1/characters/12/movies'))).toBe(
      '/api/v1/characters/:id/movies',
    );
  });

  it('Should not depend on baseUrl, which is lost on the error path', () => {
    // AppError unwinds the router stack before the handler responds, so
    // baseUrl is '' by then. The label must survive that.
    expect(routePattern(req('/api/v1/movies/99999999'))).toBe(
      '/api/v1/movies/:id',
    );
  });

  it('Should drop the query string', () => {
    expect(routePattern(req('/api/v1/movies?limit=5&page=2'))).toBe(
      '/api/v1/movies',
    );
  });

  it('Should leave a collection route alone', () => {
    expect(routePattern(req('/api/v1/movies'))).toBe('/api/v1/movies');
  });

  it('Should bucket unmatched requests together', () => {
    expect(routePattern(req('/wp-admin', false))).toBe('<unmatched>');
    expect(routePattern(req('/.env', false))).toBe('<unmatched>');
  });

  it('Should keep swagger asset requests as one bucket', () => {
    expect(routePattern(req('/docs', false))).toBe('/docs/*');
    expect(routePattern(req('/docs/swagger-ui.css', false))).toBe('/docs/*');
  });

  it('Should never emit a concrete id', () => {
    expect(routePattern(req('/api/v1/movies/123456'))).not.toContain('123456');
  });

  it('Should cap the stored pattern at the column width', () => {
    expect(routePattern(req(`/${'a'.repeat(200)}`)).length).toBeLessThanOrEqual(
      120,
    );
  });
});

describe('statusClass', () => {
  it('Should reduce a status to its leading digit', () => {
    expect(statusClass(200)).toBe(2);
    expect(statusClass(304)).toBe(3);
    expect(statusClass(429)).toBe(4);
    expect(statusClass(500)).toBe(5);
  });
});

describe('record and drain', () => {
  beforeEach(() => {
    drain();
  });

  it('Should aggregate repeat hits into a single row', () => {
    record('2026-08-05', '/api/v1/movies', 200);
    record('2026-08-05', '/api/v1/movies', 200);
    record('2026-08-05', '/api/v1/movies', 204);

    const rows = drain();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      day: '2026-08-05',
      route: '/api/v1/movies',
      status_class: 2,
      count: 3,
    });
  });

  it('Should separate rows by day, route and status class', () => {
    record('2026-08-05', '/api/v1/movies', 200);
    record('2026-08-06', '/api/v1/movies', 200);
    record('2026-08-05', '/api/v1/tvshows', 200);
    record('2026-08-05', '/api/v1/movies', 404);

    expect(drain()).toHaveLength(4);
  });

  it('Should empty the buffer once drained', () => {
    record('2026-08-05', '/api/v1/movies', 200);
    expect(bufferSize()).toBe(1);
    drain();
    expect(bufferSize()).toBe(0);
  });

  it('Should stop adding new keys once the buffer cap is reached', () => {
    for (let i = 0; i < MAX_BUFFER_KEYS + 50; i += 1) {
      record('2026-08-05', `/r/${i}`, 200);
    }
    expect(bufferSize()).toBe(MAX_BUFFER_KEYS);
  });

  it('Should still count existing keys after the cap is reached', () => {
    for (let i = 0; i < MAX_BUFFER_KEYS; i += 1) {
      record('2026-08-05', `/r/${i}`, 200);
    }
    record('2026-08-05', '/r/0', 200);

    const first = drain().find(row => row.route === '/r/0');
    expect(first?.count).toBe(2);
  });

  it('Should round-trip a route containing spaces', () => {
    record('2026-08-05', '/api/v1/a b', 200);
    expect(drain()[0].route).toBe('/api/v1/a b');
  });
});

describe('buildUpsert', () => {
  it('Should parameterise every value and add on conflict', () => {
    const { text, values } = buildUpsert([
      { day: '2026-08-05', route: '/api/v1/movies', status_class: 2, count: 7 },
      {
        day: '2026-08-05',
        route: '/api/v1/tvshows',
        status_class: 4,
        count: 1,
      },
    ]);

    expect(text).toContain('($1, $2, $3, $4), ($5, $6, $7, $8)');
    expect(text).toContain('ON CONFLICT (day, route, status_class)');
    expect(text).toContain('count = request_metrics.count + EXCLUDED.count');
    expect(values).toEqual([
      '2026-08-05',
      '/api/v1/movies',
      2,
      7,
      '2026-08-05',
      '/api/v1/tvshows',
      4,
      1,
    ]);
  });

  it('Should never interpolate a route into the SQL text', () => {
    const { text, values } = buildUpsert([
      {
        day: '2026-08-05',
        route: "'; DROP TABLE movies; --",
        status_class: 2,
        count: 1,
      },
    ]);

    expect(text).not.toContain('DROP TABLE');
    expect(values).toContain("'; DROP TABLE movies; --");
  });
});
