# MCUAPI

A RESTful API serving structured data on the Marvel Cinematic Universe — movies, TV shows, characters, and the timeline connecting them.

[![API Docs](https://img.shields.io/badge/docs-swagger-85EA2D)](https://mcuapi.up.railway.app/docs) [![Node](https://img.shields.io/badge/node-%3E%3D18-339933)](package.json)

```
baseURL  https://mcuapi.up.railway.app/api/v1
docs     https://mcuapi.up.railway.app/docs
```

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

List endpoints (`/movies`, `/tvshows`, `/characters`) return `page`, `limit`, and collection `_links` (`self`, `first`, `last`, plus `prev`/`next`), preserving all other query params. Characters are fully navigable via `GET /characters/{id}/movies` and `GET /characters/{id}/tvshows`.

> [!TIP]
> Full request/response schemas live in the [Swagger docs](https://mcuapi.up.railway.app/docs).

> [!NOTE]
> Links are built from the request host by default. Set `APP_URL` (e.g. `APP_URL=https://mcuapi.up.railway.app`) to force the base URL behind a proxy.

## Tech stack

Express · TypeScript · TypeORM · PostgreSQL — organized as Clean Architecture modules (`movies`, `tvshows`, `characters`, `timeline`) with `tsyringe` for dependency injection.

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
npm run seed:run:dev                # seed data
npm run dev:server                  # start on port 3333 (hot-reload)
```

</details>

<details>
<summary><strong>Production</strong></summary>

```bash
# NODE_ENV=production in .env

npm run typeorm migration:run       # create tables
npm run seed:run                    # seed data
npm run build                       # compile to ./dist
npm run start                       # start on port 3333
```

</details>

> [!NOTE]
> `NODE_ENV` also tells `ormconfig` where to find migrations — `src/` in development, `dist/` in production.

Have a suggestion? [Open an issue](https://github.com/AugustoMarcelo/mcuapi/issues).
