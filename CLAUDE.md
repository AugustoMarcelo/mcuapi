# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projects in this repo

| Project | Path | Stack | Port |
|---|---|---|---|
| API | repo root (`src/`) | Express + TypeScript + TypeORM + PostgreSQL, tsyringe DI | `3333` |
| MCP server | `mcuapi-mcp/` | TypeScript, `@modelcontextprotocol/sdk`, `pg`, `zod`, esbuild | stdio — no port |
| Client | `mcuapi-client/` | TypeScript, zero runtime deps, tsup (ESM+CJS), published to npm | none — it's a library |
| Landing page | `index.html` (repo root), served by GitHub Pages | Vanilla HTML/CSS/JS, no build step | none — static |

### API

```bash
# Install
yarn

# Development
yarn dev:server              # Start dev server on port 3333 (hot-reload via tsx)
yarn build                   # Compile TypeScript to dist/ and resolve path aliases

# Database
yarn typeorm:dev migration:run                              # Run migrations (development)
yarn typeorm:dev migration:create -- -n MigrationName        # Create migration
yarn seed:run:dev                                            # Seed database (development)
docker-compose up                                            # Start PostgreSQL 16 locally

# Testing
yarn test                                            # Run all tests
yarn test -- --testPathPattern=ListAllMovies         # Run a single test file
yarn test -- --coverage                              # Run with coverage report

# Production
yarn start                   # Production server (requires dist/ to exist)
```

Once running: Swagger docs at `http://localhost:3333/docs`, healthcheck at `http://localhost:3333/health`.

### MCP server (`mcuapi-mcp/`)

Activates automatically when Claude Code opens this repo, via the root `.mcp.json`. Reads DB credentials from the root `.env` (resolved relative to `dist/`); override the path with `MCP_ENV_FILE` if running from a different working directory.

```bash
cd mcuapi-mcp
npm install
npm run dev          # run against source with tsx
npm run build        # bundle to dist/index.js — rerun after any change, then restart Claude Code
```

### Client (`mcuapi-client/`)

```bash
cd mcuapi-client
npm install
npm test                                 # unit tests
MCUAPI_E2E=1 npm run test:e2e            # hits the live API instead of fakes
npm run build                            # tsup -> dist/ (ESM + CJS + .d.ts)
```

### Landing page (`index.html`)

No install or build step — edit the file directly and open it in a browser, or serve it with any static file server to preview. GitHub Pages serves it straight from the repo root on `master`; `.nojekyll` at the root disables Jekyll processing.

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
`TVShow`, plus a `Character` entity and a `/timeline` endpoint. The four fields stay
separate on purpose — `studio` is real-world production, `continuity`/`is_mcu` are
in-universe branding and canon status, `multiverse_designation` is the in-fiction
Earth — collapsing them loses a real distinction (e.g. a title can be non-canon
while still explicitly set on Earth-616).

`/upcoming` merges movies and TV shows whose `release_date` is strictly in the future
(`release_date > today`), sorted ascending; titles with a `NULL` `release_date` (announced
but undated, e.g. *Blade*) are excluded rather than sorted to either end.

`/stats` returns dataset-wide counts. `continuities` is the distinct count of
`continuity` over movies + tvshows only; `designations` is the distinct count of
`multiverse_designation` over movies + tvshows + **characters** — `Earth-838` exists only
on characters (the *Doctor Strange in the Multiverse of Madness* Illuminati), so titles
alone would undercount it. Each repository exposes a `getStats()` method that aggregates
in Postgres (`COUNT`/`MAX`/`SELECT DISTINCT`) rather than loading rows.

`src/config/swagger.json` is **hand-maintained** — nothing generates it from the routes.
Any new route needs a matching `paths` entry (and `components.schemas` entry, if it
introduces a new response shape) added by hand in the same change.

## Code Standards

- Write all code and comments in English.
- Skip comments unless the *why* isn't obvious from the code itself.
- Aggregate in Postgres (`COUNT`/`SUM`/`DISTINCT`) instead of loading rows to compute in TypeScript — see `getStats()` above for the pattern.
- Prefer early returns over nested conditionals; keep nesting to 2 levels at most.
- Never take more than 2 function parameters — pass an object instead.
- Never use `any`; add or extend a type/interface instead.

## Testing

Unit tests live alongside services (e.g., `ListAllMoviesService.spec.ts`), using fake repositories instead of a real DB — same pattern for the API and `mcuapi-client`. Every new or changed module needs tests, kept at or above 80% coverage. In the API, coverage is scoped by `collectCoverageFrom` in `jest.config.js` to `src/modules/**/services/*.ts`, `src/modules/**/infra/http/presenters/*.ts`, and `src/shared/infra/http/hateoas/*.ts` — check with `yarn test -- --coverage`.

## Domain Rules

Data sourcing, canon status, and multiverse designation for movies, TV shows, and characters are dataset content decisions, not code changes — they live in the `mcu-data-sourcing` and `mcu-canon-and-multiverse` skills, not in this file.
