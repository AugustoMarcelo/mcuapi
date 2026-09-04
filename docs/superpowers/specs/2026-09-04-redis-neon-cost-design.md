# Redis Cache and Redis Metrics Design

## Goal

Prevent repeated read requests and telemetry from keeping the Neon compute active while preserving the read-only API and one-hour public cache contract.

## Design

The API will cache successful JSON responses beneath a Redis dataset-generation namespace. A cache key combines the current generation and the exact `/api/v1` request URL; entries expire after 24 hours. MCP mutations increment the generation after their database transaction completes, making old entries unreachable without key scanning. Redis cache failures must fall through to the database.

`Cache-Control: public, max-age=3600` remains unchanged. Clients that already stored a response may therefore observe an MCP change for up to one hour; requests that reach the API observe the new generation immediately.

Request metrics move from PostgreSQL to Redis daily hashes. Each day expires after 90 days. The MCP usage report reads only those hashes, so legacy `request_metrics` data remains intact but is no longer reported.

The landing page probes `/health/live` and no longer forces uncached reads for its data widgets.

## Boundaries

- Cache only successful JSON responses under `/api/v1`; never cache health, docs, or error responses.
- Keep rate limiting on Redis before the response cache.
- Production API and MCP use the same `REDIS_URL`; local development remains usable without Redis.
- Do not alter the database schema or delete historical `request_metrics` rows.
