# Redis Neon Cost Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cache API data and request metrics in Redis so repeated traffic does not execute Neon queries or periodic telemetry writes.

**Architecture:** A shared API Redis client supports rate limiting, response caching, and daily metrics. Response entries use a versioned namespace; MCP increments the version after each successful mutation. The MCP server has its own Redis client for invalidation and reports usage from expiring Redis hashes.

**Tech Stack:** Express 5, TypeScript, Redis v5, TypeORM, pg, Jest, esbuild.

**Spec:** `docs/superpowers/specs/2026-09-04-redis-neon-cost-design.md`

## Global Constraints

- Keep `Cache-Control: public, max-age=3600` for successful public responses.
- Cache only successful JSON `/api/v1/**` responses for 86,400 seconds.
- Use exact request URLs and a Redis generation namespace; do not use `SCAN` or wildcard deletes.
- Redis failures fail open for API reads; error responses, `/health`, and docs are not cached.
- Redis metric keys expire after 90 days and MCP reports Redis-only usage.
- Code and comments are English; avoid `any`; do not add explanatory comments unless essential.

---

### Task 1: Shared API Redis client and response cache

**Files:**
- Create: `src/shared/infra/http/cache.ts`, `src/shared/infra/http/cache.spec.ts`
- Modify: `src/shared/infra/http/rateLimitStore.ts`, `src/shared/infra/http/app.ts`, `src/shared/infra/http/rateLimitStore.spec.ts`

**Interfaces:**
- Produces `cacheApiResponse`, an Express middleware that caches 200 JSON `/api/v1/**` responses for 86,400 seconds.
- Produces `getRedisClient`, `connectRedis`, and `disconnectRedis` for shared Redis use.

- [ ] Write failing middleware tests for a cache hit, exact query-key separation, and Redis failure fallback.
- [ ] Implement the shared Redis lifecycle and generation-key response cache.
- [ ] Run `yarn test --runInBand src/shared/infra/http/cache.spec.ts src/shared/infra/http/rateLimitStore.spec.ts`.

### Task 2: Redis request metrics

**Files:**
- Modify: `src/shared/infra/http/metrics.ts`, `src/shared/infra/http/metrics.spec.ts`, `src/shared/infra/http/server.ts`

**Interfaces:**
- Produces Redis daily-hash counter writes with a 90-day expiry; no API telemetry path queries PostgreSQL.

- [ ] Write failing tests for Redis metric writes, expiry, and unavailable Redis.
- [ ] Replace the Postgres flush with non-blocking Redis counter writes and remove its startup interval.
- [ ] Run `yarn test --runInBand src/shared/infra/http/metrics.spec.ts src/shared/infra/http/metricsMiddleware.spec.ts`.

### Task 3: MCP cache invalidation and usage reporting

**Files:**
- Modify: `mcuapi-mcp/package.json`, `mcuapi-mcp/src/db.ts`, `mcuapi-mcp/src/index.ts`

**Interfaces:**
- Produces `invalidateApiCache` after successful MCP mutations and Redis-backed `get_usage_stats` reporting.

- [ ] Add failing focused tests or testable helper coverage for cache invalidation and metric aggregation.
- [ ] Add the Redis dependency, lifecycle helper, mutation wrapper, and Redis-only usage report.
- [ ] Run `cd mcuapi-mcp && yarn typecheck && yarn build`.

### Task 4: Landing page and documentation contract

**Files:**
- Modify: `index.html`, `README.md`, `llms.txt`, `mcuapi-client/README.md`

- [ ] Update the landing page to probe `/health/live` and allow HTTP caching for data widgets.
- [ ] Document Redis response caching, mutation invalidation, and Redis-based telemetry without changing the public cache header.
- [ ] Run `yarn check:surfaces`, `yarn build`, and targeted API tests.

### Task 5: Whole-change verification

- [ ] Run `yarn lint`, `yarn typecheck`, `yarn test --runInBand`, `yarn build`, and `yarn check:surfaces`.
- [ ] Run MCP typecheck and build.
- [ ] Run the deslop review against the complete diff before any commit.
