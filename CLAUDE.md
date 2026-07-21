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

## Current Branch: feat/multiverse

The active branch adds multiverse/timeline support: new fields on `Movie` and `TVShow` entities (`studio`, `continuity`, `multiverse_designation`, `is_mcu`, `timeline_*`), a `Character` entity, and a `/timeline` endpoint.
