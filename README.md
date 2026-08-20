# MCUAPI

A RESTful API serving structured data on the Marvel Cinematic Universe — movies, TV shows, characters, and the timeline connecting them.

[![API Docs](https://img.shields.io/badge/docs-swagger-85EA2D)](https://mcuapi.up.railway.app/docs) [![Node](https://img.shields.io/badge/node-%3E%3D18-339933)](package.json)

```
baseURL  https://mcuapi.up.railway.app/api/v1
docs     https://mcuapi.up.railway.app/docs
openapi  https://mcuapi.up.railway.app/docs/openapi.json
health   https://mcuapi.up.railway.app/health
```

Free, open, and **no API key required**.

## Features

- **Movies & TV shows** — release info, box office, cast, saga/phase, and where each title sits in the MCU timeline.
- **Characters** — bios, actors (including recasts), and every movie/show they appear in.
- **Timeline** — chronological ordering of the whole catalog, independent of release date.
- **Hypermedia (HATEOAS)** — every resource ships a HAL-style `_links` object so clients can navigate the API without hardcoding URLs.

## Example

```http
GET /api/v1/movies/1
```

```json
{
  "id": 1,
  "title": "Iron Man",
  "_links": {
    "self": { "href": "https://mcuapi.up.railway.app/api/v1/movies/1" },
    "characters": { "href": "https://mcuapi.up.railway.app/api/v1/characters/movie/1" }
  }
}
```

List endpoints (`/movies`, `/tvshows`, `/characters`, `/people`, `/upcoming`) return `page`, `limit`, and collection `_links` (`self`, `first`, `last`, plus `prev`/`next`), preserving all other query params. Characters are fully navigable via `GET /characters/{id}/movies` and `GET /characters/{id}/tvshows`.

| Endpoint | Description |
|---|---|
| `GET /movies`, `GET /movies/{id}` | Movies, with `studio`/`continuity`/`multiverse_designation`/`is_mcu` filters |
| `GET /tvshows`, `GET /tvshows/{id}` | TV shows, same filters as movies |
| `GET /characters`, `GET /characters/{id}` | Characters, plus `/characters/movie/{id}`, `/characters/tvshow/{id}`, `/characters/{id}/movies`, `/characters/{id}/tvshows` |
| `GET /people`, `GET /people/{id}` | People (actors and directors) normalized out of the `played_by`/`directed_by` fields, plus `/people/{id}/characters` and `/people/{id}/titles` |
| `GET /post-credit-scenes`, `GET /post-credit-scenes/{id}` | Structured post- and mid-credits scenes, plus `/post-credit-scenes/movie/{id}` and `/post-credit-scenes/tvshow/{id}` |
| `GET /timeline` | Chronological ordering across continuities, independent of release date |
| `GET /upcoming` | Movies and TV shows whose `release_date` is strictly in the future, merged and sorted ascending. Titles with no announced release date are excluded. |
| `GET /titles` | Movies and TV shows merged into one paged, filterable collection (joined in Postgres via `UNION ALL`). Same filters as `/movies`/`/tvshows`, plus `type`. Unlike `/upcoming`, undated titles are included and sorted last. |
| `GET /stats` | Dataset-wide counts — movies, tvshows, characters, people, titles, and distinct continuities/designations |

> [!TIP]
> Full request/response schemas live in the [Swagger docs](https://mcuapi.up.railway.app/docs), also available as a raw [OpenAPI spec](https://mcuapi.up.railway.app/docs/openapi.json). An [`llms.txt`](llms.txt) is also published for LLM agents and tooling.

> [!NOTE]
> Links are built from the request host by default. Set `APP_URL` (e.g. `APP_URL=https://mcuapi.up.railway.app`) to force the base URL behind a proxy.

## TypeScript client

A typed client is published as [`mcuapi-client`](https://www.npmjs.com/package/mcuapi-client) — zero dependencies, ESM and CJS. Source lives in [`mcuapi-client/`](mcuapi-client).

```bash
npm install mcuapi-client
```

```ts
import { MCUAPI } from 'mcuapi-client';

const mcu = new MCUAPI();

const ironMan = await mcu.movies.get(1);

// walks every page for you by following _links.next
for await (const character of mcu.characters.all()) {
  console.log(character.name, character.played_by);
}
```

It's entirely optional — the API needs no client — but the types are derived from real production responses, so they catch things the entity definitions don't. `box_office` is a `string` (Postgres returns `bigint` as a string), and most fields are genuinely nullable.

## Static mirror (CDN)

The whole dataset is also committed to [`data/`](data) and served over jsDelivr, so it stays reachable even if the API is down — and it doesn't count against the rate limit.

```
https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/movies.json
https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/tvshows.json
https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/characters.json
https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/people.json
https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/post-credit-scenes.json
https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/timeline.json
https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/index.json
```

Each file is a plain array of the same records the API returns, `_links` included. `index.json` carries the record counts, a `generated_at` timestamp and a `content_hash`.

Pin a tag instead of `@master` if you want a fixed dataset — `@3.0.0/data/movies.json` will never change. `@master` is refreshed weekly and cached by the CDN for up to 12 hours.

The [landing page](https://augustomarcelo.github.io/mcuapi/) uses this mirror automatically: if a request to the live API fails, it re-resolves the same request against the mirror and shows a banner naming the mirror's `generated_at` date, rather than going blank.

Regenerate it with `npm run snapshot`. The output is byte-stable when the data hasn't moved, so a no-op run leaves the tree clean.

## Usage & limits

- **Read-only.** Every endpoint is a `GET`; the API never accepts writes.
- **Rate limit.** 100 requests per minute per IP. Responses carry `RateLimit-*` headers, and exceeding it returns `429`.
- **Caching.** Responses are `Cache-Control: public, max-age=3600` and carry an `ETag`. Send `If-None-Match` to get a `304` and save the transfer — the dataset only changes a few times a month.
- **Pagination.** `limit` defaults to `10` and is capped at `100`.

## Tech stack

Express · TypeScript · TypeORM · PostgreSQL — organized as Clean Architecture modules (`movies`, `tvshows`, `characters`, `people`, `postCreditScenes`, `timeline`, `upcoming`, `stats`) with `tsyringe` for dependency injection.

## Getting started

```bash
git clone https://github.com/AugustoMarcelo/mcuapi
cd mcuapi
npm install
```

Create a `.env` from `.env.example` with your database credentials.

<details>
<summary><strong>Development</strong></summary>

```bash
# NODE_ENV=development in .env

npm run typeorm:dev migration:run   # create tables
npm run dev:server                  # start on port 3333 (hot-reload)
```

</details>

<details>
<summary><strong>Production</strong></summary>

```bash
# NODE_ENV=production in .env

npm run typeorm migration:run       # create tables
npm run build                       # compile to ./dist
npm run start                       # start on port 3333
```

</details>

> [!NOTE]
> `NODE_ENV` also tells `ormconfig` where to find migrations — `src/` in development, `dist/` in production.

Have a suggestion? [Open an issue](https://github.com/AugustoMarcelo/mcuapi/issues).
