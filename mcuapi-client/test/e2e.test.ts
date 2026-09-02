/**
 * Hits the real production API. Opt-in, because it needs network and consumes
 * the 100 req/min budget:
 *
 *   yarn test:e2e
 *
 * Its job is to catch drift between these types and what the API actually
 * returns — the failure mode a stubbed suite cannot see.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { MCUAPI, MCUAPIError } from '../src/index';

const enabled = process.env.MCUAPI_E2E === '1';

describe('e2e (live API)', { skip: enabled ? false : 'set MCUAPI_E2E=1 to run' }, () => {
  const mcu = new MCUAPI({ timeout: 15_000 });

  test('health reports the service up', async () => {
    const health = await mcu.health();
    assert.equal(health.status, 'ok');
    assert.equal(health.database, 'up');
  });

  test('movie 1 matches the declared shape', async () => {
    const m = await mcu.movies.get(1);
    assert.equal(typeof m.id, 'number');
    assert.equal(typeof m.title, 'string');
    assert.equal(typeof m.is_mcu, 'boolean');
    // The one that bites people: bigint arrives as a string.
    if (m.box_office !== null) assert.equal(typeof m.box_office, 'string');
    assert.ok(m._links?.self?.href);
  });

  test('list endpoints return the pagination envelope', async () => {
    const page = await mcu.movies.list({ limit: 2 });
    assert.equal(page.data.length, 2);
    assert.equal(page.limit, 2);
    assert.ok(page.total > 0);
    assert.ok(page._links?.next?.href);
  });

  test('server caps limit at 100', async () => {
    const page = await mcu.movies.list({ limit: 100_000 });
    assert.equal(page.limit, 100);
  });

  test('paginate walks the whole collection', async () => {
    const ids = new Set<number>();
    for await (const c of mcu.characters.all({ limit: 100 })) ids.add(c.id);
    const { total } = await mcu.characters.list({ limit: 1 });
    assert.equal(ids.size, total);
  });

  test('appearance endpoints append role_type', async () => {
    const cast = await mcu.movies.characters(1);
    assert.ok(Array.isArray(cast));
    assert.ok(cast.length > 0);
    assert.ok('role_type' in cast[0]!);
  });

  test('person 1 matches the declared shape', async () => {
    const p = await mcu.people.get(1);
    assert.equal(typeof p.id, 'number');
    assert.equal(typeof p.name, 'string');
    assert.ok(p._links?.self?.href);
    assert.ok(p._links?.characters?.href);
    assert.ok(p._links?.titles?.href);
  });

  test('people.characters appends recast_order', async () => {
    const characters = await mcu.people.characters(1);
    assert.ok(Array.isArray(characters));
    assert.ok(characters.length > 0);
    assert.equal(typeof characters[0]!.recast_order, 'number');
  });

  test('people.titles returns movies and TV shows tagged with type/role', async () => {
    const titles = await mcu.people.titles(1);
    assert.ok(Array.isArray(titles));
    titles.forEach((t) => {
      assert.ok(t.type === 'movie' || t.type === 'tvshow');
      assert.equal(typeof t.role, 'string');
    });
  });

  test('timeline groups carry ordered entries', async () => {
    const groups = await mcu.timeline.get();
    assert.ok(groups.length > 0);
    const entries = groups.flatMap((g) => g.entries);
    assert.ok(entries.length > 0);
    assert.equal(typeof entries[0]!.title, 'string');
  });

  test('timeline filters by multiverse designation', async () => {
    const groups = await mcu.timeline.get({ multiverse: 'Earth-10005' });
    assert.ok(groups.length > 0);
    groups.forEach((g) => assert.equal(g.multiverse_designation, 'Earth-10005'));
  });

  test('follow() traverses a HAL link', async () => {
    const m = await mcu.movies.get(1);
    const cast = await mcu.follow<unknown[]>(m._links!.characters!);
    assert.ok(Array.isArray(cast));
  });

  test('a missing record raises MCUAPIError 404', async () => {
    await assert.rejects(
      () => mcu.movies.get(99_999_999),
      (err: unknown) => err instanceof MCUAPIError && err.isNotFound,
    );
  });
});
