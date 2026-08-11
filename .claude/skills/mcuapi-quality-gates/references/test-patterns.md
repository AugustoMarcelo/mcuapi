# Test patterns by project

Each sub-project uses a different runner and fixture style. Match the existing pattern in the file being extended rather than introducing a new one.

## API (root `src/`) — Jest + fakes

- Runner: Jest (`ts-jest`), config in `jest.config.js`. Test files are colocated with the code they test, named `*.spec.ts` (e.g. `src/modules/movies/services/ListAllMoviesService.spec.ts`).
- Each service test builds its dependencies from an in-memory **fake repository** (`repositories/fakes/FakeXRepository.ts` next to the real repository), never a real DB connection or a mock library.
- Structure: one `describe(<ModuleName>)` block per service; `beforeEach` re-instantiates the fake repository and the service under test so cases don't share state.
- `it(...)` descriptions read as a sentence: `'Should be able to list movies'`, `'Should be able to list movies sending limit params'`.
- Arrange by calling `fakeXRepository.create({...})` directly with plain field objects, act by calling `service.execute({...})`, assert with `expect(...)`.
- Coverage is scoped by `collectCoverageFrom` in `jest.config.js` to `src/modules/**/services/*.ts`, `src/modules/**/infra/http/presenters/*.ts`, and `src/shared/infra/http/hateoas/*.ts` — a new service, presenter, or HATEOAS helper needs a spec file or the repo's 80% coverage floor drops. Repositories and controllers are outside the scoped paths and are not expected to carry unit tests.

Example shape (see `src/modules/movies/services/ListAllMoviesService.spec.ts` for the full file):

```ts
import FakeMoviesRepository from '../repositories/fakes/FakeMoviesRepository';
import ListAllMoviesService from './ListAllMoviesService';

let fakeMoviesRepository: FakeMoviesRepository;
let listAllMovies: ListAllMoviesService;

describe('ListAllMovies', () => {
  beforeEach(() => {
    fakeMoviesRepository = new FakeMoviesRepository();
    listAllMovies = new ListAllMoviesService(fakeMoviesRepository);
  });

  it('Should be able to list movies', async () => {
    fakeMoviesRepository.create({ id: 1, title: 'Iron Man', directed_by: 'Jon Favreau' });

    const { data, total } = await listAllMovies.execute({});

    expect(data).toHaveLength(1);
    expect(total).toBe(1);
  });
});
```

## mcuapi-client — `node:test`

- Runner: Node's built-in test runner via `tsx --test test/*.test.ts` (`npm test`), no Jest, no external assertion library — `node:assert/strict`.
- Unit tests (`test/client.test.ts`) never hit the network: a local `stub(responses)` helper returns a fake `fetch` that records called URLs and replays canned `Response` objects, injected into `new MCUAPI({ fetch })`.
- Fixture builders (e.g. `const movie = (id): Movie => ({...}) satisfies Movie`) type-check the fixture against the real exported type instead of casting.
- `test('<behavior sentence>', async () => { ... })` — flat, no `describe` nesting.
- `test/e2e.test.ts` hits the live API and only runs opted-in: `MCUAPI_E2E=1 npm run test:e2e`. Never required for a normal change; only run it when the change touches actual HTTP behavior against the real API.
- `npm run typecheck` (`tsc --noEmit`) is a separate, required step — `npm run build` uses `tsup`/esbuild under the hood, which transpiles but does not type-check. `prepublishOnly` already chains `typecheck && test && build`; treat that chain as the reference gate order.

## mcuapi-mcp — no wired test runner

- `package.json` has no `test` script and no lint config. `npm run build` (esbuild) transpiles but, like the client's build, does **not** type-check — run `npx tsc --noEmit` (a `tsconfig.json` and `typescript` devDependency already exist) before relying on the build alone.
- `delete-movie-tool.test.mjs` at the package root is a standalone manual smoke test (spawns `dist/index.js`, drives it over JSON-RPC on stdin, asserts on the response with `node:assert/strict`) — it is **not** wired into any npm script and does not run in CI. Treat it as a template for writing a similar manual check when adding or changing a tool, not as evidence that `npm test` exists.
- If a change here is significant enough to need a regression test, follow that file's shape (spawn the built server, send JSON-RPC requests, assert on the response) and say explicitly that it was run by hand — don't imply it runs automatically.
