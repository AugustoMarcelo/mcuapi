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

A change can touch more than one (e.g. a new column used by both the API and the MCP server) — run every affected project's gates, not just one.

*Done when:* every sub-project with a changed file is listed.

**Step 2: Run that sub-project's gate commands**

| Sub-project | Lint | Typecheck | Test | Build |
|---|---|---|---|---|
| API | `yarn eslint <changed files> --ext .ts` | *(covered by build)* | `yarn test -- --testPathPattern=<Name>` | `yarn build` |
| mcuapi-client | *(no lint config)* | `npm run typecheck` | `npm test` | `npm run build` |
| mcuapi-mcp | *(no lint config)* | `npx tsc --noEmit` | *(no test script — see references/test-patterns.md)* | `npm run build` |

- Scope the API lint command to the changed files, not the whole tree: `yarn lint` runs repo-wide, and the existing backlog of pre-existing formatting errors is intentionally non-blocking in CI (see `.github/workflows/ci.yml`) until someone runs `yarn lint:fix && yarn format` once. The changed files should still come back clean.
- For mcuapi-client and mcuapi-mcp, their `build` script (tsup / esbuild) transpiles but does not type-check — the typecheck command is a separate, required step, not optional polish.
- Run the full API suite (`yarn test`) at least once per session touching `src/`, since a change in one module's shared dependency can break another module's spec.

*Done when:* every command in the row for every touched sub-project has been run in this session and exits 0, with no new lint/type/test errors introduced by the change (pre-existing backlog is out of scope).

**Step 3: Match the project's test pattern for any added or changed test**

Read `references/test-patterns.md` in full — it documents the fixture style, file naming, and assertion pattern each sub-project already uses (Jest + fake repositories for the API, `node:test` + a stub `fetch` for the client, no wired runner for mcuapi-mcp).

*Done when:* the new/changed test follows the same shape as existing tests in that sub-project, or, for mcuapi-mcp, the report states explicitly that it's a manual check rather than an automated one.
