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

## API Surface

The public HTTP API is **read-only** — every route is a `GET`. All writes happen
out-of-band through the `mcuapi-mcp/` MCP server, which connects to Postgres
directly. `MoviesController.create`/`update` and the character create/update/delete
repository methods still exist and are tested, but no route registers them.

Cross-cutting middleware lives in `src/shared/infra/http/server.ts`: rate limiting
(100 req/min per IP), `Cache-Control: public, max-age=3600` on GETs (Express
supplies the `ETag`/304 revalidation), and a `/health` endpoint used by Railway's
healthcheck. Pagination defaults and the `limit` cap live in
`src/shared/infra/http/pagination.ts` — use `resolvePage`/`resolveLimit` in
controllers rather than reading the query params directly.

Multiverse/timeline support is merged: `studio`, `continuity`,
`multiverse_designation`, `is_mcu`, `timeline_chronology_order` on `Movie` and
`TVShow`, plus a `Character` entity and a `/timeline` endpoint.

## Data Sourcing Rules

- `marvel.com` is the source of truth for most movie/TV show information and images (see also `box_office` → the-numbers.com, `trailer_url` → marvel.com/movies YouTube link).
- **Non-MCU titles**: `marvel.com` does not cover the FOX/Sony/New Line films. Use the
  distributing studio's own official site, which plays the same role for its continuity that
  marvel.com plays for the MCU. All follow a `/movies/<slug>` pattern:

  | Continuity | Official site |
  |---|---|
  | FOX X-Men / FOX Fantastic Four / FOX Daredevil | `20thcenturystudios.com/movies/<slug>` |
  | Blade trilogy (New Line) | `warnerbros.com/movies/<slug>` |
  | Sony Spider-Man Universe, Raimi and Webb Spider-Man | `sonypictures.com/movies/<slug>` |

  `box_office` comes from the-numbers.com where reachable — **but the site returns 403 to
  automated requests**, so the 18 legacy titles were filled from TMDB's `revenue` field instead.
  Spot-checked against five existing the-numbers values already in the database: TMDB runs within
  ~1% (Deadpool & Wolverine +0.00%, Captain Marvel +0.15%, The Incredible Hulk −0.30%,
  The Amazing Spider-Man 2 +1.02%). Same metric, marginally different reporting — acceptable as a
  fallback, but prefer the-numbers when you can reach it by hand.

  `trailer_url` is the official trailer's YouTube link (`https://youtu.be/<id>`), matching the
  existing MCU rows. TMDB's `/movie/{id}/videos` endpoint is a reliable way to get the official
  one without guessing IDs.
  `cover_url` comes from TMDB (`image.tmdb.org`), *not* the studio sites: they do not expose
  stable image URLs, and TMDB is already this project's image host for characters, so using it
  keeps a single image CDN across the whole dataset.
- Characters (name, bio, `played_by`, `image_url`) are sourced from TMDB (`image.tmdb.org` for images).
- **Recast characters**: `played_by` lists every actor who has played the role, comma-separated in
  **in-story chronological order** — the order the versions exist on the character's own timeline,
  not release order. For most characters the two agree (`"Edward Norton, Mark Ruffalo"`). Where a
  franchise jumps between eras they diverge, and in-story order wins:
  `"James McAvoy, Patrick Stewart"` for Xavier, even though Stewart played the role first in 2000.
  Same for Magneto, Mystique, Beast, Cyclops, Nightcrawler and Jean Grey.

  `image_url` always reflects the **most recent actor by release date** — that is a separate
  question from list order, and is why char 260 reads McAvoy-first but carries Stewart's photo
  (he appears in *Doomsday*, 2026).

  A cameo re-performed by a stunt double counts as a recast: list the originating actor first,
  then the performer (`"Ray Park, Daniel Medina Ramos"`). An actor genuinely returning to the role
  is **not** a recast — Aaron Stanford's Pyro stays a single name.
- **Animated show characters**: do not add a character from an animated series/movie unless there is a confirmed live-action actor behind the voice (i.e., an actor also appearing in live-action MCU content). Purely voice-only animated characters with no live-action counterpart are skipped.

## Canon Rules

Not every Marvel-branded production is MCU canon. Only these get
`is_mcu: true` + `continuity: "MCU"` + `multiverse_designation: "Earth-616"`:

- Everything produced by **Marvel Studios** — films and Disney+ series.
- **The Netflix Defenders Saga, and nothing else from Marvel Television**: `Daredevil`,
  `Jessica Jones`, `Luke Cage`, `Iron Fist`, `The Defenders`, `The Punisher`. Marvel Studios
  confirmed the Defenders Saga is on the Sacred Timeline after `Echo`, and Disney+ added all 13
  seasons to the official MCU timeline.

Everything else Marvel Television produced is **not** canon. Those rows carry `is_mcu: false` and
a `continuity` naming their own franchise or banner — never a generic "Marvel Television":

| Show | `continuity` |
|---|---|
| Agents of S.H.I.E.L.D. (7 seasons) | `Agents of S.H.I.E.L.D.` |
| Agent Carter (2 seasons) | `Agent Carter` |
| Runaways + Cloak & Dagger | `Marvel YA` — Marvel itself crossed them over and branded them an interconnected YA franchise |
| Helstrom | `Adventure into Fear` — the banner it was announced under |
| Inhumans | `Inhumans` |

They keep `multiverse_designation: "Earth-616"`. That is deliberate: these productions explicitly
depict Earth-616 events, no alternate reality number was ever assigned to them, and `is_mcu` +
`continuity` already carry the non-canon signal. Canon status and in-fiction reality are separate
questions — do not conflate them in one field.

When canon status is unclear, the two tiebreakers are the **official Disney+ MCU timeline** and
***Marvel Studios' The Marvel Cinematic Universe: An Official Timeline*** (2023).

Non-canon titles still belong in the database — the FOX, Sony, and New Line
continuities are all tracked — they just carry `is_mcu: false` and their own `continuity` value.

## Multiverse Designation Rules

**A designation is only used when Marvel — or a director of the title — actually stated it.**
On screen, in an official publication, or in an interview. If it was never disclosed or discussed,
the value is **`"Unknown"`**.

**Fan wikis are not a source.** Marvel Database / Fandom hand out reality numbers for practically
every adaptation (`Earth-26320`, `Earth-701306`, `Earth-121698`, `Earth-58732`, `Earth-89521`,
`Earth-86445`, …). None of those were said by Marvel or a filmmaker, so **none of them go in the
database.** "The Appendix to the Handbook of the Marvel Universe is approved by Marvel editorial"
is *not* good enough either.

Designations that meet the bar:

| Designation | Where it was stated |
|---|---|
| `Earth-616` | Said on screen in *No Way Home*; confirmed in the official timeline book |
| `Earth-838` | Said on screen in *Doctor Strange in the Multiverse of Madness* |
| `Earth-828` | On screen in *The Fantastic Four: First Steps*; confirmed by director Matt Shakman |
| `Earth-10005` | On the TVA screens in *Deadpool & Wolverine* |

Everything else that has shipped without a disclosed number is **`"Unknown"`**, and stays that way
until Marvel says otherwise. That currently means every non-MCU continuity except the FOX X-Men:

| Continuity | Designation |
|---|---|
| MCU | `Earth-616` (plus `Earth-828` for *First Steps*, `Earth-838` for the DS2 Illuminati) |
| X-Men Universe | `Earth-10005` |
| Sony Spider-Man Universe | `Unknown` — includes the Raimi and Webb films and the Venom/Morbius/Madame Web/Kraven run |
| Blade Trilogy · FOX Daredevil · FOX Fantastic Four | `Unknown` |
| *Marvel Zombies*, *Your Friendly Neighborhood Spider-Man*, the Council of Kangs variants | `Unknown` |

`Earth-96283` (Raimi), `Earth-120703` (Webb), `Earth-26320`, `Earth-701306`, `Earth-121698`,
`Earth-58732`, `Earth-89521` and `Earth-86445` were all removed for failing this bar — every one
was a Marvel Database number.

### Origin vs. where they turned up

`characters.multiverse_designation` means **origin** — the reality a character is native to. Where
they physically *are* during a given title is a different question, and the two diverge whenever
someone crosses over.

That second question lives on the appearance: `character_appearances.multiverse_designation`,
surfaced by the API as **`appeared_in`** on `/characters/movie/:id`, `/characters/tvshow/:id`,
`/characters/:id/movies` and `/characters/:id/tvshows`.

**Null is the normal case and means "the same reality the title is set in"** — so `appeared_in`
falls back to the *title's* designation, not the character's. That is deliberate: a character in
*The Fantastic Four: First Steps* is in Earth-828 because that is where the film happens. Only
fill the column when someone is somewhere the title's own designation doesn't cover — the Void
sequences in *Deadpool & Wolverine* being the clearest example.

It falls out correctly without any stored data in most cases:

| | origin | `appeared_in` |
|---|---|---|
| Reed Richards in *First Steps* | `Earth-828` | `Earth-828` |
| Reed Richards in *Doomsday* | `Earth-828` | `Earth-616` |
| Maguire's Peter in *No Way Home* | `Unknown` | `Earth-616` — visiting, not stranded |

**The database uses exactly four designations plus `"Unknown"`.** If you are about to write a
fifth, you almost certainly have a wiki number in hand — stop and find where Marvel or a director
said it.
