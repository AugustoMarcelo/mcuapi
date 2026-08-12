import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';

/**
 * Request counting.
 *
 * Counts are accumulated in memory and flushed to Postgres on an interval, so
 * a burst of traffic costs one write rather than one write per request.
 *
 * Two rules this module holds to:
 *  - It never affects the response. Every failure path is swallowed.
 *  - It never stores anything identifying: no IP, no user agent, no query
 *    string, no timestamp finer than the day.
 */

export const FLUSH_INTERVAL_MS = 60_000;

/**
 * If the database is unreachable the buffer would otherwise grow without
 * bound. Past this many distinct keys we stop adding new ones rather than
 * risk the process memory.
 */
export const MAX_BUFFER_KEYS = 5_000;

type Key = string;

/** A NUL cannot appear in a route pattern, so the key is unambiguous to split. */
const KEY_SEP = '\u0000';

const buffer = new Map<Key, number>();
let droppedKeys = 0;

export interface MetricRow {
  day: string;
  route: string;
  status_class: number;
  count: number;
}

/** `2008-05-02`, in UTC so a deploy in another region cannot shift a day boundary. */
export function today(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * A stable label for the request, e.g. `/api/v1/movies/:id`.
 *
 * Derived from `originalUrl` rather than `req.baseUrl` + `req.route.path`,
 * because `baseUrl` is not reliable at response time: services throw
 * `AppError` for a missing record, which unwinds the router stack via
 * `next(err)` before the app-level error handler responds. By then Express has
 * restored `baseUrl` to `''`, so a 404 on `/api/v1/movies/9` was being
 * recorded as `/:movie_id` while a 200 on the same route recorded correctly.
 * `originalUrl` never mutates, so this is immune to where in the stack the
 * response is produced.
 *
 * Numeric segments collapse to `:id` so the row count stays bounded by the
 * shape of the API rather than growing with traffic. Requests that matched no
 * route collapse entirely, so a scanner probing random paths cannot inflate
 * the table.
 */
export function routePattern(request: Request): string {
  const matched = Boolean(
    (request as Request & { route?: { path?: string } }).route?.path,
  );

  const path = (request.originalUrl || '/').split('?')[0];

  if (!matched) {
    // Swagger serves its assets as middleware, not routes, so it never sets
    // `req.route` — keep it as one bucket rather than losing it to <unmatched>.
    if (path === '/docs' || path.startsWith('/docs/')) return '/docs/*';
    return '<unmatched>';
  }

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

function keyOf(day: string, route: string, status: number): Key {
  return [day, route, status].join(KEY_SEP);
}

export function record(day: string, route: string, status: number): void {
  const key = keyOf(day, route, statusClass(status));
  const existing = buffer.get(key);

  if (existing === undefined && buffer.size >= MAX_BUFFER_KEYS) {
    droppedKeys += 1;
    return;
  }

  buffer.set(key, (existing ?? 0) + 1);
}

/** Empties the buffer and returns what it held. */
export function drain(): MetricRow[] {
  const rows: MetricRow[] = [];

  buffer.forEach((count, key) => {
    const [day, route, status] = key.split(KEY_SEP);
    rows.push({ day, route, status_class: Number(status), count });
  });

  buffer.clear();
  return rows;
}

/** Test seam. */
export function bufferSize(): number {
  return buffer.size;
}

export function buildUpsert(rows: MetricRow[]): {
  text: string;
  values: unknown[];
} {
  const values: unknown[] = [];
  const tuples = rows.map((row, i) => {
    const base = i * 4;
    values.push(row.day, row.route, row.status_class, row.count);
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  });

  return {
    text:
      `INSERT INTO request_metrics (day, route, status_class, count) ` +
      `VALUES ${tuples.join(', ')} ` +
      `ON CONFLICT (day, route, status_class) ` +
      `DO UPDATE SET count = request_metrics.count + EXCLUDED.count`,
    values,
  };
}

export async function flush(): Promise<number> {
  const rows = drain();
  if (!rows.length) return 0;

  try {
    const { text, values } = buildUpsert(rows);
    await getConnection().query(text, values);

    if (droppedKeys > 0) {
      // eslint-disable-next-line no-console -- surfaces buffer overflow; metrics have no other sink
      console.warn(
        `metrics: dropped ${droppedKeys} keys while buffer was full`,
      );
      droppedKeys = 0;
    }

    return rows.length;
  } catch (err) {
    // Losing counters is strictly preferable to breaking the API or
    // accumulating a buffer we can never drain.
    // eslint-disable-next-line no-console -- surfaces flush failure; metrics have no other sink
    console.error('metrics: flush failed, discarding batch', err);
    return 0;
  }
}

/**
 * Counts every response once it has been sent, so the status is final.
 *
 * `routePattern` reads only `originalUrl`, which Express never mutates, so it
 * does not matter that this runs after the router stack has unwound.
 */
export function metricsMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  response.on('finish', () => {
    try {
      record(today(), routePattern(request), response.statusCode);
    } catch {
      /* never let instrumentation break a response */
    }
  });

  next();
}

let timer: NodeJS.Timeout | undefined;

export function startMetricsFlusher(
  intervalMs: number = FLUSH_INTERVAL_MS,
): NodeJS.Timeout {
  // `flush` handles its own errors and never rejects, so nothing here can
  // produce an unhandled rejection.
  timer = setInterval(() => {
    flush().catch(() => undefined);
  }, intervalMs);

  // Do not hold the event loop open on shutdown.
  timer.unref();

  return timer;
}

export function stopMetricsFlusher(): void {
  if (timer) clearInterval(timer);
  timer = undefined;
}

/** Flush whatever is buffered before the process goes away. */
export function installMetricsShutdownHooks(): void {
  const drainAndExit = async (signal: NodeJS.Signals) => {
    stopMetricsFlusher();
    await flush();
    process.kill(process.pid, signal);
  };

  (['SIGTERM', 'SIGINT'] as NodeJS.Signals[]).forEach(signal => {
    process.once(signal, () => {
      drainAndExit(signal).catch(() => {
        process.kill(process.pid, signal);
      });
    });
  });
}
