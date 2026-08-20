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
yarn typeorm:dev migration:run -- -d src/shared/infra/typeorm/dataSource.ts        # Run migrations (development)
yarn typeorm:dev migration:create -- src/shared/infra/typeorm/migrations/MigrationName  # Create migration
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

- `src/shared/infra/typeorm/dataSource.ts` — exports `AppDataSource`, an initialized TypeORM `DataSource`; reads env vars for connection. `src/shared/infra/typeorm/index.ts` calls `AppDataSource.initialize()` and exports the promise, which `server.ts` awaits before `app.listen`.
- Dev mode uses `src/**/*.ts` source; prod uses `dist/**/*.js`
- SSL enabled when `NODE_ENV=production`
- Migrations: `src/shared/infra/typeorm/migrations/`
- TypeORM 1.x no longer auto-discovers `ormconfig.ts`. Commands that touch the database (`migration:run`, `migration:generate`) need `-d src/shared/infra/typeorm/dataSource.ts` (or the compiled `.js` path) passed explicitly; `migration:create` does not accept `-d` at all — it only writes an empty timestamped file and errors on the flag if passed.
- `.env`'s `DB_HOST` decides which database every migration and `dev:server`/`start` run actually hits — see **Environment Variables** below before running any of them.

### TypeScript Path Aliases

- `@modules/*` → `src/modules/*`
- `@config/*` → `src/config/*`
- `@shared/*` → `src/shared/*`

## Environment Variables

Required in `.env` (see `.env.example`):
```
DB_HOST, DB_USER, DB_PASS, DB_NAME, NODE_ENV
```

Root `.env` is **not pinned to local Postgres** — it currently points `DB_HOST` at the
production Neon database with `NODE_ENV=production`, which is what lets `npm run start`
serve real data locally. That means migrations and `dev:server` all hit whatever `.env`
currently says, production included, unless it's swapped first.

Before running any migration command (`yarn typeorm:dev migration:run` or its
non-`:dev` counterpart), check `DB_HOST` in `.env` first. If it resolves to the Neon
host, stop and confirm with the user before proceeding — those commands apply directly
to the live production database. For local schema/data work, point `.env` at
`docker-compose up`'s local Postgres instead: the local-Postgres values are backed up,
untracked, in `.env.local-backup`.

Tests never need this at all — the API's Jest suite runs against fake repositories, not
a real connection (see Testing), so there's no reason to touch `DB_HOST` just to run
`yarn test`.

## API Surface

The public HTTP API is **read-only** — every route is a `GET`. All writes happen
out-of-band through the `mcuapi-mcp/` MCP server, which connects to Postgres
directly. `MoviesController.create`/`update` and the character create/update/delete
repository methods still exist and are tested, but no route registers them.

Cross-cutting middleware lives in `src/shared/infra/http/server.ts`: rate limiting
(100 req/min per IP), `Cache-Control: public, max-age=3600` on GETs (Express
supplies the `ETag`/304 revalidation), and a `/health` endpoint reporting API and
database status. Railway's healthcheck (`railway.json`) points at `/health/live`
instead, a DB-less liveness check -- Railway polls it continuously, and a `/health`
query there would keep the Neon compute permanently awake, defeating scale-to-zero
and burning free-tier compute-hours. Pagination defaults and the `limit` cap live in
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

More generally, a resource can be consumed through up to seven surfaces — `swagger.json`,
`mcuapi-client`, `mcuapi-mcp`, the landing page's live console, `llms.txt`, `README.md`,
and the static snapshot — and none of them is generated from the routes. Adding, renaming,
or removing a resource requires an explicit decision for each, recorded in
`scripts/surface-manifest.json` and enforced by `yarn check:surfaces`; see the
`mcuapi-surface-sync` skill.

## Code Standards

- Write all code and comments in English.
- Default to zero comments. A comment is only justified when the code truly cannot speak for itself — a regex, a bit-twiddling trick, a workaround forced by a library/Postgres quirk that would otherwise look like a mistake and get "fixed" back into a bug. Explaining a design choice, restating what a variable is for, or narrating "why" for something a reasonable reader would infer from names and structure does not qualify — that belongs in the PR description, not the file. When in doubt, delete it.
- Run the `deslop` skill against the full branch diff before any commit, not just before opening a PR — it is not a one-time step tucked into `mcuapi-quality-gates`, it's part of finishing any change. If it isn't clearing out comments that don't meet the bar above, that's a signal to re-run it more critically, not to leave them in.
- Aggregate in Postgres (`COUNT`/`SUM`/`DISTINCT`) instead of loading rows to compute in TypeScript — see `getStats()` above for the pattern.
- Prefer early returns over nested conditionals; keep nesting to 2 levels at most.
- Never take more than 2 function parameters — pass an object instead.
- Never use `any`; add or extend a type/interface instead.

## Testing

Unit tests live alongside services (e.g., `ListAllMoviesService.spec.ts`), using fakes instead of a real DB or live network. Every new or changed module needs tests, kept at or above 80% coverage. In the API, coverage is scoped by `collectCoverageFrom` in `jest.config.js` to `src/modules/**/services/*.ts`, `src/modules/**/infra/http/presenters/*.ts`, and `src/shared/infra/http/hateoas/*.ts` — check with `yarn test -- --coverage`.

The API also has `supertest` integration tests that send real HTTP requests through the full Express stack, separate from and not counted toward the coverage scope above: one colocated with each module's routes (e.g. `src/modules/movies/infra/http/routes/movies.routes.spec.ts`), plus `src/shared/infra/http/app.spec.ts` for cross-cutting behavior (404, error handler) that doesn't belong to any one module. New or changed routes need one of these, not just a unit test — see the `mcuapi-quality-gates` skill for the pattern and when it applies.

The API, `mcuapi-mcp`, and `mcuapi-client` each use a different test runner and fixture style, and only some of them have lint/typecheck wired up at all — see the `mcuapi-quality-gates` skill for the exact commands and pattern per sub-project, and run its gates for every sub-project a change touches before calling the work done.

## Domain Rules

Data sourcing, canon status, and multiverse designation for movies, TV shows, and characters are dataset content decisions, not code changes — they live in the `mcu-data-sourcing` and `mcu-canon-and-multiverse` skills, not in this file.
