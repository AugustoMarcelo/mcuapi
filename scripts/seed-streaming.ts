/**
 * One-off bootstrap for streaming availability.
 *
 * Fills in only the part that is unambiguous — Disney-produced, Disney-
 * distributed MCU titles on Disney+ — and deliberately leaves everything
 * contested empty for hand-curation through the MCP tools. An empty row is
 * honest; a wrong row is worse than nothing, because consumers cannot tell
 * the difference.
 *
 *   npm run seed:streaming -- --dry-run
 *   npm run seed:streaming
 *
 * Idempotent: re-running updates nothing and inserts nothing new.
 *
 * What is deliberately excluded, and why:
 *
 *  - Anything released within THEATRICAL_WINDOW_MONTHS. A film in cinemas
 *    streams nowhere. Spider-Man: Brand New Day came out five days before
 *    this was written; a naive `release_date <= today` rule would have
 *    claimed it was on Disney+.
 *  - Spider-Man titles. Sony co-productions whose streaming rights follow
 *    Sony's output deals and move between services and territories.
 *  - The Incredible Hulk. Universal holds distribution; its availability has
 *    rotated on and off Disney+.
 *  - Every non-Marvel-Studios continuity (FOX X-Men, Sony's Spider-Man
 *    Universe). Different owners, different deals, no safe default.
 */
import path from 'path';

import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({
  path: path.resolve(
    __dirname,
    '..',
    process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
  ),
});

const THEATRICAL_WINDOW_MONTHS = 4;
const PROVIDER = 'Disney+';
const OFFER_TYPE = 'subscription';
const REGIONS = ['US', 'BR'];

const dryRun = process.argv.includes('--dry-run');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

/**
 * Titles that are Marvel Studios MCU on paper but whose streaming rights sit
 * elsewhere. Listed explicitly rather than pattern-matched: an earlier
 * `title NOT ILIKE 'Spider-Man%'` would also have caught "Your Friendly
 * Neighborhood Spider-Man", which is a Disney+ original and belongs here.
 */
const RIGHTS_HELD_ELSEWHERE = [
  'The Incredible Hulk', // Universal holds distribution
  'Spider-Man: Homecoming', // Sony co-productions from here down
  'Spider-Man: Far From Home',
  'Spider-Man: No Way Home',
  'Spider-Man: Brand New Day',
];

/** Shared by both tables; movies additionally wait out the theatrical window. */
const OWNED_BY_DISNEY = `
  studio = 'Marvel Studios'
  AND continuity = 'MCU'
  AND is_mcu = true
  AND release_date IS NOT NULL
  AND title <> ALL($1::text[])`;

async function selectTitles(
  table: 'movies' | 'tvshows',
): Promise<{ id: number; title: string }[]> {
  // Disney+ originals stream on release day, so only films need the window.
  const released =
    table === 'movies'
      ? `release_date <= CURRENT_DATE - INTERVAL '${THEATRICAL_WINDOW_MONTHS} months'`
      : 'release_date <= CURRENT_DATE';

  const { rows } = await pool.query<{ id: number; title: string }>(
    `SELECT id, title FROM ${table}
      WHERE ${OWNED_BY_DISNEY} AND ${released}
      ORDER BY release_date`,
    [RIGHTS_HELD_ELSEWHERE],
  );

  return rows;
}

async function main(): Promise<void> {
  const movies = await selectTitles('movies');
  const tvshows = await selectTitles('tvshows');

  process.stdout.write(
    `${movies.length} movies and ${tvshows.length} TV shows qualify, ` +
      `× ${REGIONS.length} regions = ${
        (movies.length + tvshows.length) * REGIONS.length
      } rows\n`,
  );

  if (dryRun) {
    process.stdout.write('\nMovies:\n');
    movies.forEach(m => process.stdout.write(`  ${m.id}\t${m.title}\n`));
    process.stdout.write('\nTV shows:\n');
    tvshows.forEach(t => process.stdout.write(`  ${t.id}\t${t.title}\n`));
    process.stdout.write('\nDry run — nothing written.\n');
    await pool.end();
    return;
  }

  let inserted = 0;

  const upsert = async (column: 'movie_id' | 'tvshow_id', id: number) => {
    for (const region of REGIONS) {
      // eslint-disable-next-line no-await-in-loop
      const { rowCount } = await pool.query(
        `INSERT INTO streaming_availability (${column}, region, provider, offer_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (${column}, region, provider, offer_type)
           WHERE ${column} IS NOT NULL
         DO NOTHING`,
        [id, region, PROVIDER, OFFER_TYPE],
      );
      inserted += rowCount ?? 0;
    }
  };

  for (const movie of movies) {
    // eslint-disable-next-line no-await-in-loop
    await upsert('movie_id', movie.id);
  }
  for (const show of tvshows) {
    // eslint-disable-next-line no-await-in-loop
    await upsert('tvshow_id', show.id);
  }

  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM streaming_availability',
  );

  process.stdout.write(
    `Inserted ${inserted} new row(s); table now holds ${rows[0].count}.\n`,
  );

  await pool.end();
}

main().catch(err => {
  process.stderr.write(`seed failed: ${(err as Error).message}\n`);
  process.exit(1);
});
