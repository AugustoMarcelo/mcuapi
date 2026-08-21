import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MCUAPI, MCUAPIError } from '../src/index';
import type {
  Character,
  Movie,
  Paginated,
  PostCreditScene,
  Stats,
  TitleItem,
  UpcomingItem,
  WithRole,
} from '../src/index';

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

const postCreditScene = (id: number): PostCreditScene =>
  ({
    id,
    movie_id: 1,
    tvshow_id: null,
    description: `Scene ${id}`,
    teases_movie_id: null,
    teases_tvshow_id: null,
    is_stinger: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }) satisfies PostCreditScene;

const upcomingItem = (id: number): UpcomingItem =>
  ({
    id,
    type: 'movie',
    title: `Upcoming ${id}`,
    release_date: '2027-05-01',
    overview: null,
    cover_url: null,
    continuity: 'MCU',
    multiverse_designation: 'Earth-616',
    is_mcu: true,
    phase: null,
    saga: null,
  }) satisfies UpcomingItem;

const titleItem = (id: number): TitleItem =>
  ({
    id,
    type: 'movie',
    title: `Title ${id}`,
    release_date: null,
    overview: null,
    cover_url: null,
    continuity: 'MCU',
    multiverse_designation: 'Earth-616',
    is_mcu: true,
    phase: null,
    saga: null,
  }) satisfies TitleItem;

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

test('people.list builds the default path', async () => {
  const { fetch, calls } = stub([{ body: { data: [], total: 0, page: 1, limit: 10 } }]);
  await new MCUAPI({ fetch }).people.list();
  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/people');
});

test('people.get requests a single person', async () => {
  const { fetch, calls } = stub([
    { body: { id: 1, name: 'Zoe Saldana', created_at: '2026-01-01', updated_at: '2026-01-01' } },
  ]);
  await new MCUAPI({ fetch }).people.get(1);
  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/people/1');
});

test('people.characters requests the recast relation endpoint', async () => {
  const { fetch, calls } = stub([{ body: [] }]);
  await new MCUAPI({ fetch }).people.characters(1);
  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/people/1/characters');
});

test('people.titles requests the directed-titles relation endpoint', async () => {
  const { fetch, calls } = stub([{ body: [] }]);
  await new MCUAPI({ fetch }).people.titles(1);
  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/people/1/titles');
});

test('people.all paginates like the other collections', async () => {
  const person = (id: number) => ({
    id,
    name: `Person ${id}`,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  });
  const page = (ids: number[], next?: string) => ({
    data: ids.map(person),
    total: 4,
    page: 1,
    limit: 2,
    _links: next ? { next: { href: next } } : {},
  });

  const { fetch, calls } = stub([
    { body: page([1, 2], 'https://mcuapi.up.railway.app/api/v1/people?limit=2&page=2') },
    { body: page([3, 4]) },
  ]);

  const seen: number[] = [];
  for await (const p of new MCUAPI({ fetch }).people.all()) seen.push(p.id);

  assert.deepEqual(seen, [1, 2, 3, 4]);
  assert.equal(calls.length, 2);
});

test('postCreditScenes.list builds the default path', async () => {
  const { fetch, calls } = stub([{ body: { data: [], total: 0, page: 1, limit: 10 } }]);
  await new MCUAPI({ fetch }).postCreditScenes.list();
  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/post-credit-scenes');
});

test('postCreditScenes.get requests a single scene', async () => {
  const { fetch, calls } = stub([{ body: postCreditScene(1) }]);
  await new MCUAPI({ fetch }).postCreditScenes.get(1);
  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/post-credit-scenes/1');
});

test('movies.postCreditScenes requests the movie relation endpoint', async () => {
  const { fetch, calls } = stub([{ body: [] }]);
  await new MCUAPI({ fetch }).movies.postCreditScenes(1);
  assert.equal(
    calls[0],
    'https://mcuapi.up.railway.app/api/v1/post-credit-scenes/movie/1',
  );
});

test('tvshows.postCreditScenes requests the tvshow relation endpoint', async () => {
  const { fetch, calls } = stub([{ body: [] }]);
  await new MCUAPI({ fetch }).tvshows.postCreditScenes(1);
  assert.equal(
    calls[0],
    'https://mcuapi.up.railway.app/api/v1/post-credit-scenes/tvshow/1',
  );
});

test('postCreditScenes.all paginates like the other collections', async () => {
  const page = (ids: number[], next?: string) => ({
    data: ids.map(postCreditScene),
    total: 4,
    page: 1,
    limit: 2,
    _links: next ? { next: { href: next } } : {},
  });

  const { fetch, calls } = stub([
    {
      body: page(
        [1, 2],
        'https://mcuapi.up.railway.app/api/v1/post-credit-scenes?limit=2&page=2',
      ),
    },
    { body: page([3, 4]) },
  ]);

  const seen: number[] = [];
  for await (const s of new MCUAPI({ fetch }).postCreditScenes.all()) seen.push(s.id);

  assert.deepEqual(seen, [1, 2, 3, 4]);
  assert.equal(calls.length, 2);
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

test('upcoming.list() hits /api/v1/upcoming and serialises filters', async () => {
  const { fetch, calls } = stub([
    { body: { data: [upcomingItem(1)], total: 1, page: 1, limit: 10 } },
  ]);

  const { data } = await new MCUAPI({ fetch }).upcoming.list({
    type: 'movie',
    is_mcu: true,
  });

  const url = new URL(calls[0]!);
  assert.equal(url.pathname, '/api/v1/upcoming');
  assert.equal(url.searchParams.get('type'), 'movie');
  assert.equal(url.searchParams.get('is_mcu'), 'true');
  assert.equal(data[0]!.title, 'Upcoming 1');
});

test('upcoming.all() paginates the merged movies/tvshows list', async () => {
  const page = (ids: number[], next?: string): Paginated<UpcomingItem> => ({
    data: ids.map(upcomingItem),
    total: 3,
    page: 1,
    limit: 2,
    _links: next ? { next: { href: next } } : {},
  });

  const { fetch, calls } = stub([
    { body: page([1, 2], 'https://mcuapi.up.railway.app/api/v1/upcoming?limit=2&page=2') },
    { body: page([3]) },
  ]);

  const seen: number[] = [];
  for await (const item of new MCUAPI({ fetch }).upcoming.all()) seen.push(item.id);

  assert.deepEqual(seen, [1, 2, 3]);
  assert.equal(calls.length, 2);
});

test('titles.list() hits /api/v1/titles and serialises filters, including type', async () => {
  const { fetch, calls } = stub([
    { body: { data: [titleItem(1)], total: 1, page: 1, limit: 10 } },
  ]);

  const { data } = await new MCUAPI({ fetch }).titles.list({
    type: 'tvshow',
    is_mcu: true,
    studio: 'Marvel Studios',
  });

  const url = new URL(calls[0]!);
  assert.equal(url.pathname, '/api/v1/titles');
  assert.equal(url.searchParams.get('type'), 'tvshow');
  assert.equal(url.searchParams.get('is_mcu'), 'true');
  assert.equal(url.searchParams.get('studio'), 'Marvel Studios');
  assert.equal(data[0]!.title, 'Title 1');
});

test('titles.all() paginates the merged movies/tvshows list', async () => {
  const page = (ids: number[], next?: string): Paginated<TitleItem> => ({
    data: ids.map(titleItem),
    total: 3,
    page: 1,
    limit: 2,
    _links: next ? { next: { href: next } } : {},
  });

  const { fetch, calls } = stub([
    { body: page([1, 2], 'https://mcuapi.up.railway.app/api/v1/titles?limit=2&page=2') },
    { body: page([3]) },
  ]);

  const seen: number[] = [];
  for await (const item of new MCUAPI({ fetch }).titles.all()) seen.push(item.id);

  assert.deepEqual(seen, [1, 2, 3]);
  assert.equal(calls.length, 2);
});

test('search.list() hits /api/v1/search and serialises q and type', async () => {
  const character = {
    id: 2,
    type: 'character' as const,
    name: 'Tony Stark',
    alias: 'Iron Man',
    description: null,
    image_url: null,
    played_by: 'Robert Downey Jr.',
    continuity: 'MCU',
    multiverse_designation: 'Earth-616',
    variant_of: null,
    first_appearance_movie_id: 1,
    first_appearance_tvshow_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  const { fetch, calls } = stub([
    { body: { data: [character], total: 1, page: 1, limit: 10 } },
  ]);

  const { data } = await new MCUAPI({ fetch }).search.list({
    q: 'Iron Man',
    type: 'character',
  });

  const url = new URL(calls[0]!);
  assert.equal(url.pathname, '/api/v1/search');
  assert.equal(url.searchParams.get('q'), 'Iron Man');
  assert.equal(url.searchParams.get('type'), 'character');
  assert.equal(data[0]!.type, 'character');
});

test('search.all() paginates hits mixed across types', async () => {
  const page = (
    hits: Array<{ id: number; type: 'movie' | 'person' }>,
    next?: string,
  ): Paginated<unknown> => ({
    data: hits.map(hit =>
      hit.type === 'movie'
        ? movie(hit.id)
        : { id: hit.id, type: 'person', name: `Person ${hit.id}`, created_at: '', updated_at: '' },
    ),
    total: 2,
    page: 1,
    limit: 1,
    _links: next ? { next: { href: next } } : {},
  });

  const { fetch, calls } = stub([
    {
      body: page(
        [{ id: 1, type: 'movie' }],
        'https://mcuapi.up.railway.app/api/v1/search?q=Iron&limit=1&page=2',
      ),
    },
    { body: page([{ id: 3, type: 'person' }]) },
  ]);

  const seen: string[] = [];
  for await (const hit of new MCUAPI({ fetch }).search.all({ q: 'Iron' })) {
    seen.push(hit.type);
  }

  assert.deepEqual(seen, ['movie', 'person']);
  assert.equal(calls.length, 2);
});

test('stats.get() hits /api/v1/stats', async () => {
  const stats: Stats = {
    movies: 74,
    tvshows: 56,
    characters: 314,
    people: 372,
    titles: 130,
    continuities: 10,
    designations: 5,
    last_updated: '2026-01-01T00:00:00.000Z',
  };
  const { fetch, calls } = stub([{ body: stats }]);

  const result = await new MCUAPI({ fetch }).stats.get();

  assert.equal(calls[0], 'https://mcuapi.up.railway.app/api/v1/stats');
  assert.equal(result.titles, 130);
});

test('movies.characters() returns appeared_in alongside role_type', async () => {
  const appearance: WithRole<Character> = {
    id: 1,
    name: 'Wade Wilson',
    alias: 'Deadpool',
    description: null,
    image_url: null,
    played_by: 'Ryan Reynolds',
    continuity: 'MCU',
    multiverse_designation: 'Earth-10005',
    variant_of: null,
    first_appearance_movie_id: null,
    first_appearance_tvshow_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    role_type: 'main',
    appeared_in: 'Void',
  };
  const { fetch } = stub([{ body: [appearance] }]);

  const [result] = await new MCUAPI({ fetch }).movies.characters(1);

  assert.equal(result!.role_type, 'main');
  assert.equal(result!.appeared_in, 'Void');
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
