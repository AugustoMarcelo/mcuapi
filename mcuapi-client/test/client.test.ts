import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MCUAPI, MCUAPIError } from '../src/index';
import type { Movie, Paginated } from '../src/index';

/** Records the URLs it was called with and replays canned responses. */
function stub(
  responses: Array<{ status?: number; body: unknown }>,
): { fetch: typeof globalThis.fetch; calls: string[] } {
  const calls: string[] = [];
  let i = 0;

  const fetch = (async (url: string | URL) => {
    calls.push(String(url));
    const next = responses[Math.min(i, responses.length - 1)];
    i += 1;
    const status = next?.status ?? 200;
    return new Response(JSON.stringify(next?.body ?? null), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof globalThis.fetch;

  return { fetch, calls };
}

const movie = (id: number): Movie =>
  ({
    id,
    title: `Movie ${id}`,
    box_office: '585171547',
    release_date: null,
    duration: null,
    overview: null,
    cover_url: null,
    trailer_url: null,
    directed_by: null,
    phase: null,
    saga: null,
    chronology: null,
    post_credit_scenes: 0,
    imdb_id: null,
    studio: null,
    continuity: null,
    multiverse_designation: null,
    is_mcu: true,
    type: 'movie',
    timeline_chronology_order: null,
    updated_at: '2026-01-01T00:00:00.000Z',
  }) satisfies Movie;

test('builds the default base URL and path', async () => {
  const { fetch, calls } = stub([{ body: { data: [], total: 0, page: 1, limit: 10 } }]);
  await new MCUAPI({ fetch }).movies.list();
  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/movies');
});

test('serialises query params and omits undefined ones', async () => {
  const { fetch, calls } = stub([{ body: { data: [], total: 0, page: 1, limit: 5 } }]);
  await new MCUAPI({ fetch }).movies.list({
    limit: 5,
    filter: 'title=Spider',
    is_mcu: false,
    studio: undefined,
  });

  const url = new URL(calls[0]!);
  assert.equal(url.searchParams.get('limit'), '5');
  assert.equal(url.searchParams.get('filter'), 'title=Spider');
  assert.equal(url.searchParams.get('is_mcu'), 'false');
  assert.equal(url.searchParams.has('studio'), false);
});

test('strips a trailing slash from a custom base URL', async () => {
  const { fetch, calls } = stub([{ body: movie(1) }]);
  await new MCUAPI({ fetch, baseUrl: 'http://localhost:3333/' }).movies.get(1);
  assert.equal(calls[0], 'http://localhost:3333/api/v1/movies/1');
});

test('encodes path parameters', async () => {
  const { fetch, calls } = stub([{ body: movie(1) }]);
  await new MCUAPI({ fetch }).characters.get('a b/c');
  assert.ok(calls[0]!.endsWith('/api/v1/characters/a%20b%2Fc'));
});

test('throws MCUAPIError carrying status and parsed body', async () => {
  const { fetch } = stub([{ status: 404, body: { message: 'Movie not found' } }]);
  await assert.rejects(
    () => new MCUAPI({ fetch }).movies.get(9999),
    (err: unknown) => {
      assert.ok(err instanceof MCUAPIError);
      assert.equal(err.status, 404);
      assert.equal(err.isNotFound, true);
      assert.equal(err.isRateLimited, false);
      assert.match(err.message, /Movie not found/);
      return true;
    },
  );
});

test('flags rate limiting on 429', async () => {
  const { fetch } = stub([{ status: 429, body: { message: 'Too many requests' } }]);
  await assert.rejects(
    () => new MCUAPI({ fetch }).movies.list(),
    (err: unknown) => err instanceof MCUAPIError && err.isRateLimited,
  );
});

test('paginate follows _links.next and stops when absent', async () => {
  const page = (ids: number[], next?: string): Paginated<Movie> => ({
    data: ids.map(movie),
    total: 4,
    page: 1,
    limit: 2,
    _links: next ? { next: { href: next } } : {},
  });

  const { fetch, calls } = stub([
    { body: page([1, 2], 'https://mcuapi.up.railway.app/api/v1/movies?limit=2&page=2') },
    { body: page([3, 4]) },
  ]);

  const seen: number[] = [];
  for await (const m of new MCUAPI({ fetch }).movies.all()) seen.push(m.id);

  assert.deepEqual(seen, [1, 2, 3, 4]);
  assert.equal(calls.length, 2);
  // requests the max page size up front rather than the server default of 10
  assert.ok(calls[0]!.includes('limit=100'));
});

test('follow() accepts a link object or a raw href', async () => {
  const { fetch, calls } = stub([{ body: movie(3) }, { body: movie(4) }]);
  const mcu = new MCUAPI({ fetch });

  await mcu.follow<Movie>({ href: 'https://mcuapi.up.railway.app/api/v1/movies/3' });
  await mcu.follow<Movie>('https://mcuapi.up.railway.app/api/v1/movies/4');

  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/movies/3');
  assert.equal(calls[1], 'https://mcuapi.up.railway.app/api/v1/movies/4');
});

test('honours an external AbortSignal', async () => {
  const controller = new AbortController();
  const fetch = (async (_u: string, init?: RequestInit) =>
    new Promise((_res, rej) => {
      init?.signal?.addEventListener('abort', () =>
        rej(Object.assign(new Error('aborted'), { name: 'AbortError' })),
      );
    })) as unknown as typeof globalThis.fetch;

  const promise = new MCUAPI({ fetch }).movies.list({}, { signal: controller.signal });
  controller.abort();
  await assert.rejects(promise, /abort/i);
});

test('times out when the option is set', async () => {
  const fetch = (async (_u: string, init?: RequestInit) =>
    new Promise((_res, rej) => {
      init?.signal?.addEventListener('abort', () =>
        rej(Object.assign(new Error('aborted'), { name: 'AbortError' })),
      );
    })) as unknown as typeof globalThis.fetch;

  await assert.rejects(
    () => new MCUAPI({ fetch, timeout: 20 }).movies.list(),
    /abort/i,
  );
});

test('merges custom headers', async () => {
  let sent: Record<string, string> = {};
  const fetch = (async (_u: string, init?: RequestInit) => {
    sent = init?.headers as Record<string, string>;
    return new Response('{}', { status: 200 });
  }) as unknown as typeof globalThis.fetch;

  await new MCUAPI({ fetch, headers: { 'User-Agent': 'test/1.0' } }).health();
  assert.equal(sent['User-Agent'], 'test/1.0');
  assert.equal(sent.Accept, 'application/json');
});

test('surfaces a non-JSON error body as raw text', async () => {
  const fetch = (async () =>
    new Response('<html>502</html>', { status: 502 })) as unknown as typeof globalThis.fetch;

  await assert.rejects(
    () => new MCUAPI({ fetch }).movies.list(),
    (err: unknown) => err instanceof MCUAPIError && err.body === '<html>502</html>',
  );
});

test('rejects construction when no fetch is available anywhere', () => {
  const original = globalThis.fetch;
  // @ts-expect-error deliberately removing it to simulate an old runtime
  delete globalThis.fetch;
  try {
    assert.throws(() => new MCUAPI(), /No fetch implementation/);
  } finally {
    globalThis.fetch = original;
  }
});
