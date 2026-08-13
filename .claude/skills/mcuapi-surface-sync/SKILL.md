---
name: mcuapi-surface-sync
description: Cross-surface checklist for API resource/route changes in mcuapi -- when a resource is added, renamed, or removed, or a response shape changes, decide for each of swagger.json, the landing page console, mcuapi-client, llms.txt, README.md, the static snapshot, and mcuapi-mcp whether it's in, exempt, or todo, and record it in scripts/surface-manifest.json. Use when adding/removing an API resource or route, or changing a response shape. Don't use for dataset content (see mcu-data-sourcing, mcu-canon-and-multiverse) or for lint/test/build commands (see mcuapi-quality-gates).
---

# mcuapi Surface Sync

The `people` resource shipped across three PRs but only reached some of its downstream surfaces — `swagger.json` had it, the landing page's live console, `mcuapi-client`, `README.md`, `llms.txt`, and the static snapshot didn't. Nothing forced anyone to look at each surface and decide. This skill is that forcing function.

## Steps

**Step 1: Does this change touch the API surface?**

New or renamed or removed resource, a new or changed route, or a changed response shape ⇒ continue. A change confined to internal services/repositories with no route or response change ⇒ this skill doesn't apply.

*Done when:* you've stated which of the above applies.

**Step 2: Read the surface matrix**

A resource mounted under `/api/v1` in `src/shared/infra/http/routes/index.ts` has up to seven downstream surfaces:

| Surface | File | Entry shape |
|---|---|---|
| `swagger` | `src/config/swagger.json` | a `paths` entry `/api/v1/<resource>` (+ `components.schemas` if it's a new shape) — hand-maintained, see `CLAUDE.md` |
| `console` | `index.html`, the `ENDPOINTS` array (`var ENDPOINTS = [ … ]`) | `{ path: '/api/v1/<resource>', label: '/<resource>', params: LIST_PARAMS, defaults: {...} }` — note the console's path-param placeholder is always the literal token `{id}` even when the real route uses a different name (e.g. `{person_id}`) |
| `client` | `mcuapi-client/src/client.ts` + `types.ts` + `index.ts` | a `readonly <resource> = { list, get, all, ...relations }` block, a matching type in `types.ts`, re-exported from `index.ts`; plus a `mcuapi-client/README.md` table row and `test/client.test.ts` coverage |
| `llms` | `llms.txt`, the `## Key endpoints` section | one `` `GET /<resource>`, `GET /<resource>/{id}` `` bullet |
| `readme` | `README.md`, the `\| Endpoint \| Description \|` table | one table row; also check the jsDelivr URL list and the tech-stack module list further down the file |
| `snapshot` | `scripts/build-snapshot.ts` + `data/` | collected into `data/<resource>.json`, counted in `data/index.json` |
| `mcp` | `mcuapi-mcp/src/index.ts` | write tools (`create_/update_/delete_<singular>`) if the resource supports writes, plus coverage in `search_content`'s type enum and `get_stats`'s counts |

Not every resource belongs on every surface — `/upcoming` and `/stats` are legitimately absent from several (they're derived/aggregate, not primary collections). That's a valid answer; the point is that it's a chosen one.

*Done when:* you can name, for this change's resource(s), which surfaces are plausibly affected.

**Step 3: Decide per surface and record it in `scripts/surface-manifest.json`**

For each of the seven surfaces, the resource's entry needs exactly one of:

- **`in`** — it's there. `yarn check:surfaces` greps the surface's file to confirm.
- **`exempt`** — deliberately not applicable, with a non-empty reason string (see `upcoming`/`stats` in the manifest for the pattern).
- **`todo`** — belongs there, not done yet, referenced by a `"#<issue-number>"` GitHub issue. This doesn't block the change; it makes the gap visible instead of silent.

A brand-new resource needs a full manifest entry (see `movies` for the "in everywhere" shape, `people` for the "in progress" shape). Not deciding — a surface in none of the three buckets — is what `yarn check:surfaces` treats as a hard failure.

*Done when:* the resource has a manifest entry with all seven surfaces classified.

**Step 4: Verify**

Run `yarn check:surfaces` and confirm it exits 0 (warnings for open `todo`s are fine; errors are not). Then run the `mcuapi-quality-gates` skill for every sub-project this change actually touched — a `client` or `console` entry marked `in` pulls `mcuapi-client` and/or the landing page into scope, and any `index.html` change triggers that skill's Step 5 screenshot/video requirement.

*Done when:* `yarn check:surfaces` exits 0 and the touched sub-projects' gates pass.
