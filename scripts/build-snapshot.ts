/**
 * Builds the static JSON snapshot served over jsDelivr.
 *
 * The point is availability: the API is a single Railway service, and the
 * closed issues on this repo are mostly people reporting it was down. A copy
 * of the data sitting in the repo and fronted by a CDN means a consumer can
 * fall back to something that still works, at no hosting cost.
 *
 *   npm run snapshot                 # from the live API
 *   npm run snapshot -- --base=...   # from somewhere else
 *
 * Output is deterministic: records are sorted by id, and `generated_at` only
 * moves when the data itself changes. A run that finds nothing new leaves the
 * working tree clean, so the scheduled workflow does not commit noise.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DEFAULT_BASE = 'https://mcuapi.up.railway.app';
const PAGE_SIZE = 100; // the API caps `limit` here
const OUT_DIR = path.resolve(__dirname, '..', 'data');

interface Envelope<T> {
  data: T[];
  total: number;
}

interface Identified {
  id: number;
}

function baseUrl(): string {
  const flag = process.argv.find(arg => arg.startsWith('--base='));
  return (flag ? flag.slice('--base='.length) : DEFAULT_BASE).replace(
    /\/+$/,
    '',
  );
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${url}`);
  }

  return (await response.json()) as T;
}

/** Walks every page of a list endpoint. */
async function collectAll<T extends Identified>(
  base: string,
  resource: string,
): Promise<T[]> {
  const records: T[] = [];
  let page = 1;
  let total = Infinity;

  while (records.length < total) {
    const url = `${base}/api/v1/${resource}?limit=${PAGE_SIZE}&page=${page}`;

    // Each page's request depends on `total` from the previous response, so
    // pages can't be fetched in parallel.
    // eslint-disable-next-line no-await-in-loop
    const envelope = await getJson<Envelope<T>>(url);

    total = envelope.total;
    records.push(...envelope.data);

    if (!envelope.data.length) break; // defensive: never spin on an empty page
    page += 1;
  }

  if (records.length !== total) {
    throw new Error(
      `${resource}: collected ${records.length} records but the API reports ${total}`,
    );
  }

  // Sort so the committed file only changes when the data does.
  return records.sort((a, b) => a.id - b.id);
}

function write(file: string, value: unknown): number {
  const target = path.join(OUT_DIR, file);
  const body = `${JSON.stringify(value, null, 2)}\n`;
  fs.writeFileSync(target, body);
  return Buffer.byteLength(body);
}

function existingGeneratedAt(hash: string): string | null {
  try {
    const previous = JSON.parse(
      fs.readFileSync(path.join(OUT_DIR, 'index.json'), 'utf8'),
    ) as { content_hash?: string; generated_at?: string };

    return previous.content_hash === hash
      ? (previous.generated_at ?? null)
      : null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const base = baseUrl();
  process.stdout.write(`Snapshotting ${base}\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const [movies, tvshows, characters, people, postCreditScenes, timeline] =
    await Promise.all([
      collectAll<Identified>(base, 'movies'),
      collectAll<Identified>(base, 'tvshows'),
      collectAll<Identified>(base, 'characters'),
      collectAll<Identified>(base, 'people'),
      collectAll<Identified>(base, 'post-credit-scenes'),
      getJson<{ entries: unknown[] }[]>(`${base}/api/v1/timeline`),
    ]);

  const payloads = {
    movies,
    tvshows,
    characters,
    people,
    postCreditScenes,
    timeline,
  };
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(payloads))
    .digest('hex')
    .slice(0, 16);

  const sizes = {
    'movies.json': write('movies.json', movies),
    'tvshows.json': write('tvshows.json', tvshows),
    'characters.json': write('characters.json', characters),
    'people.json': write('people.json', people),
    'post-credit-scenes.json': write(
      'post-credit-scenes.json',
      postCreditScenes,
    ),
    'timeline.json': write('timeline.json', timeline),
  };

  const timelineEntries = timeline.reduce(
    (sum, group) => sum + group.entries.length,
    0,
  );

  const unchanged = existingGeneratedAt(hash);
  if (unchanged) {
    process.stdout.write('Data unchanged since the last snapshot.\n');
  }

  write('index.json', {
    generated_at: unchanged ?? new Date().toISOString(),
    content_hash: hash,
    source: `${base}/api/v1`,
    counts: {
      movies: movies.length,
      tvshows: tvshows.length,
      characters: characters.length,
      people: people.length,
      post_credit_scenes: postCreditScenes.length,
      timeline_branches: timeline.length,
      timeline_entries: timelineEntries,
    },
    files: Object.entries(sizes).map(([file, bytes]) => ({ file, bytes })),
    notes: [
      'Static mirror of the MCUAPI dataset, served via jsDelivr.',
      'Use it as a fallback when the live API is unreachable, or to avoid rate limits for bulk reads.',
      'Record shapes are identical to the API, including _links — but those hrefs point at the live API, which may itself be down.',
      'Regenerated on a schedule; check generated_at for freshness.',
    ],
  });

  const totalBytes = Object.values(sizes).reduce((a, b) => a + b, 0);
  process.stdout.write(
    [
      `  movies            ${movies.length}`,
      `  tvshows           ${tvshows.length}`,
      `  characters        ${characters.length}`,
      `  people            ${people.length}`,
      `  post-credit       ${postCreditScenes.length}`,
      `  timeline branches ${timeline.length} (${timelineEntries} entries)`,
      `  total             ${(totalBytes / 1024).toFixed(1)} kB`,
      `  content hash      ${hash}`,
      '',
    ].join('\n'),
  );
}

main().catch(err => {
  process.stderr.write(`snapshot failed: ${(err as Error).message}\n`);
  process.exit(1);
});
