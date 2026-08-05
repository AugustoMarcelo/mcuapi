# mcuapi

Typed client for [MCUAPI](https://augustomarcelo.github.io/mcuapi/) — Marvel
Cinematic Universe movies, TV shows, characters, and the chronology that orders
them.

No API key. No runtime dependencies. ESM and CJS. ~9 kB.

```bash
npm install mcuapi
```

## Usage

```ts
import { MCUAPI } from 'mcuapi';

const mcu = new MCUAPI();

const ironMan = await mcu.movies.get(1);
//    ^? Movie

const { data, total } = await mcu.movies.list({
  filter: 'title=Spider',
  order: 'release_date,DESC',
  limit: 5,
});
```

Requires Node 18+ (for global `fetch`), or pass your own — see [Options](#options).

## Reading a whole collection

`limit` is capped at 100 server-side. `.all()` walks the pages for you by
following the API's own `_links.next`, yielding one record at a time:

```ts
for await (const character of mcu.characters.all()) {
  console.log(character.name, character.played_by);
}
```

## Following hypermedia links

Every resource ships HAL-style `_links`, so you can traverse the graph without
building paths yourself:

```ts
const movie = await mcu.movies.get(1);
const cast = await mcu.follow(movie._links!.characters!);
```

## API

| Call | Returns |
| --- | --- |
| `mcu.movies.list(params?)` | `Paginated<Movie>` |
| `mcu.movies.get(id)` | `Movie` |
| `mcu.movies.all(params?)` | `AsyncGenerator<Movie>` |
| `mcu.movies.characters(id)` | `WithRole<Character>[]` |
| `mcu.tvshows.list(params?)` | `Paginated<TVShow>` |
| `mcu.tvshows.get(id)` | `TVShow` |
| `mcu.tvshows.all(params?)` | `AsyncGenerator<TVShow>` |
| `mcu.tvshows.characters(id)` | `WithRole<Character>[]` |
| `mcu.characters.list(params?)` | `Paginated<Character>` |
| `mcu.characters.get(id)` | `Character` |
| `mcu.characters.all(params?)` | `AsyncGenerator<Character>` |
| `mcu.characters.movies(id)` | `WithRole<Movie>[]` |
| `mcu.characters.tvshows(id)` | `WithRole<TVShow>[]` |
| `mcu.timeline.get(params?)` | `TimelineGroup[]` |
| `mcu.health()` | `Health` |
| `mcu.follow(link)` | whatever the link points at |

List params: `page`, `limit`, `order`, `filter`, `continuity`,
`multiverse_designation` — plus `studio` and `is_mcu` on movies and TV shows.
`timeline.get()` takes `multiverse`.

## Two things worth knowing

**`box_office` is a string, not a number.** Postgres returns `bigint` as a
string to avoid precision loss, so you get `"585171547"`. Convert deliberately:

```ts
const gross = movie.box_office ? Number(movie.box_office) : null;
```

**Most fields are nullable, including obvious ones.** Recently announced titles
often have no `release_date`, `phase`, `saga`, `box_office`, or `runtime` yet.
The types reflect what the API really returns — verified against production, not
copied from the server's entity definitions — so the compiler will make you
handle it.

## Errors

Non-2xx responses throw `MCUAPIError`:

```ts
import { MCUAPIError } from 'mcuapi';

try {
  await mcu.movies.get(99999);
} catch (err) {
  if (err instanceof MCUAPIError) {
    err.status;        // 404
    err.isNotFound;    // true
    err.isRateLimited; // true only on 429
    err.body;          // parsed JSON body, or raw text
  }
}
```

The API allows 100 requests per minute per IP and sends `RateLimit-*` headers.

## Options

```ts
const mcu = new MCUAPI({
  baseUrl: 'http://localhost:3333', // point at your own instance
  timeout: 10_000,                  // per-request, in ms
  headers: { 'User-Agent': 'my-app/1.0' },
  fetch: myFetch,                   // undici, a proxy agent, a test double
});
```

Every method takes an optional `{ signal }` for cancellation:

```ts
const controller = new AbortController();
const page = await mcu.movies.list({}, { signal: controller.signal });
```

## Caching

Responses carry `Cache-Control: public, max-age=3600` and an `ETag`. The dataset
changes a few times a month, so an HTTP cache in front of this client will
absorb almost all traffic.

## Licence

MIT. Source and issues: https://github.com/AugustoMarcelo/mcuapi

Not affiliated with Marvel, Marvel Studios, or The Walt Disney Company.
