/**
 * Enforces that every API resource has an explicit, recorded decision for
 * each downstream surface it could appear on (docs, client, MCP server,
 * landing page, static mirror) — instead of silently landing in some and
 * not others, which is how `people` shipped half-wired across PRs
 * #110/#111/#112.
 *
 * A resource/surface pair must be exactly one of:
 *   - `in`      — present; this script greps the surface's file to prove it.
 *   - `exempt`  — deliberately not applicable, with a written reason.
 *   - `todo`    — belongs there but isn't done yet, tracked by a GitHub issue.
 *
 * Undecided (in none of the three) or unlisted resources are a hard failure.
 * `todo` prints as a warning, not a failure — the point is to force a
 * decision, not to block work in flight.
 *
 *   yarn check:surfaces
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

interface ResourceEntry {
  in?: string[];
  exempt?: Record<string, string>;
  todo?: Record<string, string>;
  /** Override for surfaces (like mcp tool names) that use the singular form. */
  singular?: string;
}

interface Manifest {
  surfaces: string[];
  resources: Record<string, ResourceEntry>;
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

/** Resource names mounted under /api/v1 in the route table — the source of truth. */
function discoverResources(): string[] {
  const source = read('src/shared/infra/http/routes/index.ts');
  const matches = [...source.matchAll(/routes\.use\('\/api\/v1\/([a-z-]+)'/g)];
  return matches.map(m => m[1]);
}

function loadManifest(): Manifest {
  return JSON.parse(read('scripts/surface-manifest.json')) as Manifest;
}

/** Presence checks — deliberately shallow greps, not parsers. They prove a
 * resource wasn't simply forgotten, not that the entry is correct. */
const checks: Record<string, (resource: string, singular: string) => boolean> =
  {
    swagger: resource => {
      const swagger = JSON.parse(read('src/config/swagger.json')) as {
        paths: Record<string, unknown>;
      };
      return Object.keys(swagger.paths).some(p => p.split('/')[3] === resource);
    },

    console: resource => {
      const html = read('index.html');
      const start = html.indexOf('var ENDPOINTS = [');
      const end = html.indexOf('];', start);
      if (start === -1 || end === -1) return false;
      const block = html.slice(start, end);
      return block.includes(`/api/v1/${resource}`);
    },

    client: resource => {
      const source = read('mcuapi-client/src/client.ts');
      return (
        new RegExp(`readonly ${resource}\\s*=`).test(source) ||
        source.includes(`/api/v1/${resource}`)
      );
    },

    llms: resource => {
      const text = read('llms.txt');
      const start = text.indexOf('## Key endpoints');
      const end = text.indexOf('\n## ', start + 1);
      const block =
        start === -1 ? text : text.slice(start, end === -1 ? undefined : end);
      return new RegExp(`/${resource}\\b`).test(block);
    },

    readme: resource => {
      const text = read('README.md');
      const start = text.indexOf('| Endpoint | Description |');
      const end = text.indexOf('\n\n', start);
      const block =
        start === -1 ? text : text.slice(start, end === -1 ? undefined : end);
      return new RegExp(`/${resource}\\b`).test(block);
    },

    snapshot: resource => {
      const source = read('scripts/build-snapshot.ts');
      return new RegExp(`\\b${resource}\\b`).test(source);
    },

    mcp: (_resource, singular) => {
      // Tool names are snake_case (e.g. `create_person`, `get_timeline`), so a
      // real \b won't fire across the underscore — plain substring is enough
      // for a "was this forgotten" check.
      const source = read('mcuapi-mcp/src/index.ts').toLowerCase();
      return source.includes(singular.toLowerCase());
    },
  };

function main(): void {
  const resources = discoverResources();
  const manifest = loadManifest();
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const resource of resources) {
    const entry = manifest.resources[resource];
    if (!entry) {
      errors.push(
        `resource '${resource}' has no manifest entry in scripts/surface-manifest.json`,
      );
      continue;
    }

    const singular = entry.singular ?? resource.replace(/s$/, '');
    const inSet = new Set(entry.in ?? []);
    const exemptSet = new Set(Object.keys(entry.exempt ?? {}));
    const todoSet = new Set(Object.keys(entry.todo ?? {}));

    for (const surface of manifest.surfaces) {
      const classified = [
        inSet.has(surface),
        exemptSet.has(surface),
        todoSet.has(surface),
      ];
      const count = classified.filter(Boolean).length;

      if (count === 0) {
        errors.push(
          `resource '${resource}' has no decision recorded for surface '${surface}'`,
        );
        continue;
      }
      if (count > 1) {
        errors.push(
          `resource '${resource}' surface '${surface}' is classified more than once (in/exempt/todo must be mutually exclusive)`,
        );
        continue;
      }

      if (exemptSet.has(surface)) {
        const reason = entry.exempt?.[surface]?.trim();
        if (!reason) {
          errors.push(
            `resource '${resource}' surface '${surface}' is exempt but has no reason`,
          );
        }
        continue;
      }

      if (todoSet.has(surface)) {
        const issue = entry.todo?.[surface]?.trim();
        if (!issue || !/^#\d+$/.test(issue)) {
          errors.push(
            `resource '${resource}' surface '${surface}' is todo but has no '#<issue>' reference`,
          );
          continue;
        }
        warnings.push(
          `resource '${resource}' surface '${surface}' is still todo (${issue})`,
        );
        continue;
      }

      // inSet.has(surface)
      const check = checks[surface];
      if (!check(resource, singular)) {
        errors.push(
          `resource '${resource}' is marked 'in' for surface '${surface}' but wasn't found there`,
        );
      }
    }
  }

  for (const w of warnings) process.stdout.write(`warning: ${w}\n`);
  for (const e of errors) process.stderr.write(`error: ${e}\n`);

  if (errors.length > 0) {
    process.stderr.write(`\n${errors.length} surface parity error(s).\n`);
    process.exit(1);
  }

  process.stdout.write(
    `Surface parity OK — ${resources.length} resource(s), ${warnings.length} still-open todo(s).\n`,
  );
}

main();
