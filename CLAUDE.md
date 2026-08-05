# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev:server          # Start dev server on port 3333 (hot-reload via tsx)
npm run build               # Compile TypeScript to dist/ and resolve path aliases

# Database
npm run typeorm:dev migration:run   # Run migrations (development)
npm run typeorm:dev migration:create -- -n MigrationName  # Create migration
npm run seed:run:dev                # Seed database (development)
docker-compose up                   # Start PostgreSQL 16 locally

# Testing
npm run test                        # Run all tests
npm run test -- --testPathPattern=ListAllMovies  # Run a single test file

# Production
npm run start                       # Production server (requires dist/ to exist)
```

## Architecture

This is a RESTful API for MCU (Marvel Cinematic Universe) data built with **Express + TypeScript + TypeORM + PostgreSQL**, following Clean Architecture with **tsyringe** for dependency injection.

### Module Structure

Each domain module (`movies`, `tvshows`, `characters`, `timeline`) follows this layered pattern:

```
modules/[name]/
├── entities/           # Domain interfaces (IMovie, ITVShow, etc.)
├── dtos/               # Request/response DTOs
├── services/           # Business logic (@injectable services)
├── repositories/
│   ├── IXXXRepository.ts       # Repository interface
│   ├── fakes/                  # In-memory fakes for unit tests
│   └── infra/typeorm/          # TypeORM implementations
└── infra/http/
    ├── controllers/             # Express controllers
    └── routes/                  # Route definitions
```

### Request Flow

HTTP Request → `src/shared/infra/http/routes/index.ts` → Module routes → Controller → `container.resolve(Service)` → Repository → PostgreSQL

### Dependency Injection

- Container registered in `src/shared/container/index.ts`
- Services decorated with `@injectable()`
- Controllers use `container.resolve(ServiceClass)` directly (not constructor injection)

### Database

- `ormconfig.ts` at root — reads env vars for connection
- Dev mode uses `src/**/*.ts` source; prod uses `dist/**/*.js`
- SSL enabled when `NODE_ENV=production`
- Migrations: `src/shared/infra/typeorm/migrations/`
- Seeds: `src/shared/infra/typeorm/seeds/`

### TypeScript Path Aliases

- `@modules/*` → `src/modules/*`
- `@config/*` → `src/config/*`
- `@shared/*` → `src/shared/*`

### Testing Pattern

Unit tests live alongside services (e.g., `ListAllMoviesService.spec.ts`). Tests use fake repositories (not real DB). Coverage collected only from `src/modules/**/services/*.ts`.

## Environment Variables

Required in `.env` (see `.env.example`):
```
DB_HOST, DB_USER, DB_PASS, DB_NAME, NODE_ENV
```

## API Surface

The public HTTP API is **read-only** — every route is a `GET`. All writes happen
out-of-band through the `mcuapi-mcp/` MCP server, which connects to Postgres
directly. `MoviesController.create`/`update` and the character create/update/delete
repository methods still exist and are tested, but no route registers them.

Cross-cutting middleware lives in `src/shared/infra/http/server.ts`: rate limiting
(100 req/min per IP), `Cache-Control: public, max-age=3600` on GETs (Express
supplies the `ETag`/304 revalidation), and a `/health` endpoint used by Railway's
healthcheck. Pagination defaults and the `limit` cap live in
`src/shared/infra/http/pagination.ts` — use `resolvePage`/`resolveLimit` in
controllers rather than reading the query params directly.

Multiverse/timeline support is merged: `studio`, `continuity`,
`multiverse_designation`, `is_mcu`, `timeline_chronology_order` on `Movie` and
`TVShow`, plus a `Character` entity and a `/timeline` endpoint.

## Streaming availability

`streaming_availability` holds one row per title × region × provider ×
`offer_type`, exposed at `/movies/{id}/streaming`, `/tvshows/{id}/streaming`
and `/streaming/providers`. Curate it through the `set_streaming_availability`
/ `get_streaming_availability` / `delete_streaming_availability` MCP tools.

**Sourcing rules — these matter more than coverage:**

- **First-party only.** Do not import from TMDB, JustWatch or similar. Their
  watch-provider data is JustWatch-licensed, requires per-item attribution, and
  forbids deep links — obligations this API cannot pass on to its consumers.
- **Never record a title still in cinemas.** Films get a four-month theatrical
  buffer; `release_date <= today` alone is not "released to streaming".
  Disney+ originals stream on release day and need no buffer.
- **Leave contested titles empty.** Sony's Spider-Man films, The Incredible
  Hulk (Universal), and the FOX X-Men era have rights that move by territory.
  A blank is honest; a guess is worse than nothing because consumers cannot
  tell the two apart.
- Region is ISO 3166-1 alpha-2, uppercase. Seed bootstrap:
  `npm run seed:streaming -- --dry-run`.

## Data Sourcing Rules

- `marvel.com` is the source of truth for most movie/TV show information and images (see also `box_office` → the-numbers.com, `trailer_url` → marvel.com/movies YouTube link).
- Characters (name, bio, `played_by`, `image_url`) are sourced from TMDB (`image.tmdb.org` for images).
- **Recast characters**: `played_by` lists every actor who has played the role, comma-separated in chronological order (e.g. `"Edward Norton, Mark Ruffalo"`), but `image_url` always reflects the *current/most recent* actor — update it when a character is recast rather than leaving the original actor's photo.
- **Animated show characters**: do not add a character from an animated series/movie unless there is a confirmed live-action actor behind the voice (i.e., an actor also appearing in live-action MCU content). Purely voice-only animated characters with no live-action counterpart are skipped.
