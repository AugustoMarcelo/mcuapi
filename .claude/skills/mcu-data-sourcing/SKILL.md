---
name: mcu-data-sourcing
description: Source-of-truth rules for movie, TV show, and character field values in the mcuapi dataset -- marvel.com and studio official sites, TMDB, the-numbers.com, and recast/animated-character conventions. Use when adding a new movie, TV show, or character to mcuapi, or filling in a sourced field such as box_office, trailer_url, cover_url, played_by, or image_url. Don't use for API architecture, endpoint behavior, or coding conventions.
---

# MCU Data Sourcing

Where each mcuapi field comes from, so two agents filling in the same field reach the same answer.

## Reference

- **Movies/TV shows, general fields**: `marvel.com` is the source of truth for MCU titles.
- **Non-MCU titles**: `marvel.com` does not cover the FOX/Sony/New Line films. Use the distributing studio's own official site instead — it plays the same role for its continuity that marvel.com plays for the MCU. All follow a `/movies/<slug>` pattern:

  | Continuity | Official site |
  |---|---|
  | FOX X-Men / FOX Fantastic Four / FOX Daredevil | `20thcenturystudios.com/movies/<slug>` |
  | Blade trilogy (New Line) | `warnerbros.com/movies/<slug>` |
  | Sony Spider-Man Universe, Raimi and Webb Spider-Man | `sonypictures.com/movies/<slug>` |

- **`box_office`**: the-numbers.com, where reachable. The site returns 403 to automated requests, so the 18 legacy titles were filled from TMDB's `revenue` field instead — spot-checked against five existing the-numbers values already in the database, TMDB runs within ~1% (Deadpool & Wolverine +0.00%, Captain Marvel +0.15%, The Incredible Hulk −0.30%, The Amazing Spider-Man 2 +1.02%). Acceptable as a fallback, but prefer the-numbers when reachable by hand.
- **`trailer_url`**: the official trailer's YouTube link (`https://youtu.be/<id>`), matching existing MCU rows. TMDB's `/movie/{id}/videos` endpoint reliably surfaces the official one without guessing IDs.
- **`cover_url`**: TMDB (`image.tmdb.org`), never the studio sites — they expose no stable image URLs, and TMDB is already this project's image host for characters, so this keeps a single image CDN across the whole dataset.
- **Characters** (`name`, `bio`, `played_by`, `image_url`): sourced from TMDB, `image.tmdb.org` for images.

### Recast characters

`played_by` lists every actor who has played the role, comma-separated in **in-story chronological order** — the order the versions exist on the character's own timeline, not release order. For most characters the two agree (`"Edward Norton, Mark Ruffalo"`). Where a franchise jumps between eras they diverge, and in-story order wins: `"James McAvoy, Patrick Stewart"` for Xavier, even though Stewart played the role first in 2000. Same for Magneto, Mystique, Beast, Cyclops, Nightcrawler and Jean Grey.

`image_url` always reflects the **most recent actor by release date** — a separate question from list order, and why char 260 reads McAvoy-first but carries Stewart's photo (he appears in *Doomsday*, 2026).

A cameo re-performed by a stunt double counts as a recast: list the originating actor first, then the performer (`"Ray Park, Daniel Medina Ramos"`). An actor genuinely returning to the role is **not** a recast — Aaron Stanford's Pyro stays a single name.

### Animated show characters

Do not add a character from an animated series/movie unless there is a confirmed live-action actor behind the voice (i.e. an actor who also appears in live-action MCU content). Purely voice-only animated characters with no live-action counterpart are skipped.
