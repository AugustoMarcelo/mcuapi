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

## API (root `src/`) — supertest integration tests

Unit tests above call a controller method directly with a hand-built mock `Request`/`Response`. These instead send a real HTTP request through the full Express stack (middleware, routing, controller, error handler) via `supertest`, importing the app rather than the controller.

- **Per-module route spec** (`src/modules/<name>/infra/http/routes/<name>.routes.spec.ts`, e.g. `movies.routes.spec.ts` next to `movies.routes.ts`): imports the shared app from `@shared/infra/http/app`, mocks `container.resolve` with `jest.spyOn` in `beforeEach`/restores in `afterEach` (not the fake-repository pattern above — the goal here is exercising real HTTP wiring, not business logic), and asserts on `response.status`/`response.body`/`response.headers` for **one representative route**. This is not the place to re-test a service's business logic (that's the unit test's job) — one passing-case request is enough to prove the module is wired into `routes/index.ts` and returns a real HTTP response.
- **`src/shared/infra/http/app.spec.ts`**: scoped to behavior that belongs to `app.ts` itself, not any one module — the 404 fallback for an unmatched route, and the error handler's `AppError`→status/message and generic-`Error`→500 paths. Do **not** add a new module's route case here; put it in that module's colocated spec instead.
- **Standalone router spec** (e.g. `src/shared/infra/http/routes/health.routes.spec.ts`): for a router not wired through a module's controller/service stack, mount just that router on a bare `express()` instance instead of the full app, and mock its direct dependency (e.g. `typeorm`'s `getConnection`) rather than `container.resolve`.

Example shape (see `src/modules/movies/infra/http/routes/movies.routes.spec.ts` for the full file):

```ts
import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('movies.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should list movies through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({ data: [{ id: 1, title: 'Iron Man' }], total: 1 }),
    });

    const response = await request(app).get('/api/v1/movies');

    expect(response.status).toBe(200);
    expect(response.body.data[0].title).toBe('Iron Man');
  });
});
```

## mcuapi-client — `node:test`

- Runner: Node's built-in test runner via `tsx --test test/*.test.ts` (`yarn test`), no Jest, no external assertion library — `node:assert/strict`.
- Unit tests (`test/client.test.ts`) never hit the network: a local `stub(responses)` helper returns a fake `fetch` that records called URLs and replays canned `Response` objects, injected into `new MCUAPI({ fetch })`.
- Fixture builders (e.g. `const movie = (id): Movie => ({...}) satisfies Movie`) type-check the fixture against the real exported type instead of casting.
- `test('<behavior sentence>', async () => { ... })` — flat, no `describe` nesting.
- `test/e2e.test.ts` hits the live API and only runs opted-in: `MCUAPI_E2E=1 yarn test:e2e`. Never required for a normal change; only run it when the change touches actual HTTP behavior against the real API.
- `yarn typecheck` (`tsc --noEmit`) is a separate, required step — `yarn build` uses `tsup`/esbuild under the hood, which transpiles but does not type-check. `prepublishOnly` runs the equivalent direct `typecheck && test && build` sequence; treat that order as the reference gate order.

## mcuapi-mcp — no wired test runner

- `package.json` has no `test` script and no lint config. `yarn build` (esbuild) transpiles but, like the client's build, does **not** type-check — run `yarn tsc --noEmit` (a `tsconfig.json` and `typescript` devDependency already exist) before relying on the build alone.
- `delete-movie-tool.test.mjs` at the package root is a standalone manual smoke test (spawns `dist/index.js`, drives it over JSON-RPC on stdin, asserts on the response with `node:assert/strict`) — it is **not** wired into a package script and does not run in CI. Treat it as a template for writing a similar manual check when adding or changing a tool, not as evidence that a test script exists.
- If a change here is significant enough to need a regression test, follow that file's shape (spawn the built server, send JSON-RPC requests, assert on the response) and say explicitly that it was run by hand — don't imply it runs automatically.
