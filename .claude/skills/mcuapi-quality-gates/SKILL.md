---
name: mcuapi-quality-gates
description: Quality gates for mcuapi -- the lint, typecheck, test, and build commands for each sub-project (API, mcuapi-mcp, mcuapi-client), plus each project's test-writing pattern. Use before claiming any code change in this repo complete, before committing, or before opening a PR -- run the touched project's gates and confirm they pass. Also use when writing or modifying a test, to match the existing pattern for that project. Don't use for dataset content rules -- see mcu-data-sourcing and mcu-canon-and-multiverse.
---

# mcuapi Quality Gates

This repo is three independently-tooled sub-projects sharing one working tree. A gate that passes in one (`yarn build` at the root) says nothing about the others. Run the gate for every sub-project a change touched before calling the work done.

## Steps

**Step 1: Identify the touched sub-project(s)**

| Path touched | Sub-project | Run gates from |
|---|---|---|
| `src/`, root `*.ts` | API | repo root |
| `mcuapi-mcp/` | MCP server | `mcuapi-mcp/` |
| `mcuapi-client/` | Client | `mcuapi-client/` |
| `index.html` | Landing page | n/a — see Step 5 |

A change can touch more than one (e.g. a new column used by both the API and the MCP server) — run every affected project's gates, not just one.

If the change adds, renames, or removes an API resource or route, or changes a response shape, also run the `mcuapi-surface-sync` skill — it covers the surfaces (client, MCP, landing page console, docs, static snapshot) that these gates don't.

*Done when:* every sub-project with a changed file is listed.

**Step 2: Run that sub-project's gate commands**

| Sub-project | Lint | Typecheck | Test | Build |
|---|---|---|---|---|
| API | `yarn eslint <changed files> --ext .ts` | `yarn typecheck` | `yarn test -- --testPathPattern=<Name>` | `yarn build` |
| mcuapi-client | *(no lint config)* | `npm run typecheck` | `npm test` | `npm run build` |
| mcuapi-mcp | *(no lint config)* | `npx tsc --noEmit` | *(no test script — see references/test-patterns.md)* | `npm run build` |

- Scope the API lint command to the changed files, not the whole tree: `yarn lint` runs repo-wide, and the existing backlog of pre-existing formatting errors is intentionally non-blocking in CI (see `.github/workflows/ci.yml`) until someone runs `yarn lint:fix && yarn format` once. The changed files should still come back clean.
- For mcuapi-client and mcuapi-mcp, their `build` script (tsup / esbuild) transpiles but does not type-check — the typecheck command is a separate, required step, not optional polish. The API's `yarn build` does type-check (it's a `tsc` compile), but `yarn typecheck` is still the faster, no-emit way to run the same check.
- Run the full API suite (`yarn test`) at least once per session touching `src/`, since a change in one module's shared dependency can break another module's spec.
- CI (`.github/workflows/ci.yml`) is no longer API-only — `build`, `client`, and `mcp` jobs each run their own sub-project's gates on every push/PR, so a change that fails a gate here fails CI too, not just a local check.

*Done when:* every command in the row for every touched sub-project has been run in this session and exits 0, with no new lint/type/test errors introduced by the change (pre-existing backlog is out of scope).

**Step 3: Match the project's test pattern for any added or changed test**

Read `references/test-patterns.md` in full — it documents the fixture style, file naming, and assertion pattern each sub-project already uses (Jest + fake repositories for the API, `node:test` + a stub `fetch` for the client, no wired runner for mcuapi-mcp).

For the API specifically, decide whether an integration test is also needed, not just a unit test:

| Change | Integration test needed |
|---|---|
| New route, or a change to an existing route's status/body/headers, inside a module | Add/update that module's colocated `<name>.routes.spec.ts` (see `references/test-patterns.md`) |
| New standalone router (not behind a module's controller/service, e.g. `health.routes.ts`) | Give it its own colocated spec |
| Change to `app.ts`'s own cross-cutting behavior (middleware, error handler, 404 fallback) | Update `src/shared/infra/http/app.spec.ts` |
| Service/business-logic change with no HTTP-wiring change | Unit test only — no integration spec needed |

*Done when:* the new/changed test follows the same shape as existing tests in that sub-project, the table above has been checked for any API route/wiring change, and, for mcuapi-mcp, the report states explicitly that it's a manual check rather than an automated one.

**Step 4: Run the `deslop` skill against the whole branch diff**

Unlike Steps 1-2, this runs once for the entire branch diff, not per sub-project — invoke the `deslop` skill to strip AI-generated slop (unnecessary comments, abnormal defensive checks, `any` casts, unneeded nesting) introduced anywhere in the branch before considering the gate satisfied.

*Done when:* the `deslop` skill has been run against the full branch diff and its findings addressed.

**Step 5: Landing page (`index.html`) changes need visual proof in the PR, not just a text description**

`index.html` has no lint/typecheck/test/build — the only gate is manually driving it in a browser (see the repo's `run` skill for the headless-Chromium pattern). That verification is not optional and its evidence belongs in the PR itself:

- Any PR touching `index.html` must attach at least one **screenshot** of the changed area rendered, and a **screen recording/video** for anything interactive (the live console, search boxes, nav/scroll behavior, hover states) — not just a written description of what was checked.
- Attach these directly to the PR body/comment (drag-and-drop in the GitHub UI, or `gh pr comment --body-file` referencing local capture output) so a reviewer can see the actual result without re-running the page themselves.

*Done when:* the PR contains embedded screenshot(s) for static changes and a video for interactive ones, alongside the text description of what was verified.
