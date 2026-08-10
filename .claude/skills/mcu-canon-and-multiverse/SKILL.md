---
name: mcu-canon-and-multiverse
description: Canon and multiverse classification rules for mcuapi movies, TV shows, and characters -- is_mcu, continuity, and multiverse_designation assignment, plus the origin vs. appeared_in distinction for character appearances. Use when adding a new title or character, judging whether a production is MCU canon, choosing a continuity name, or assigning an Earth designation. Don't use for data sourcing (see mcu-data-sourcing) or coding conventions.
---

# MCU Canon & Multiverse Classification

How `is_mcu`, `continuity`, and `multiverse_designation` get assigned across movies, TV shows, and characters, and how a character's origin reality differs from where they turn up in a given title.

The MCP server (`mcuapi-mcp/src/rules.ts`) mechanically validates these enum values on write; this skill covers the judgment calls validation can't automate — which productions qualify, which continuity name to use, whether a designation has actually been disclosed.

## Canon rules

Not every Marvel-branded production is MCU canon. Only these get `is_mcu: true` + `continuity: "MCU"` + `multiverse_designation: "Earth-616"`:

- Everything produced by **Marvel Studios** — films and Disney+ series.
- **The Netflix Defenders Saga, and nothing else from Marvel Television**: `Daredevil`, `Jessica Jones`, `Luke Cage`, `Iron Fist`, `The Defenders`, `The Punisher`. Marvel Studios confirmed the Defenders Saga is on the Sacred Timeline after `Echo`, and Disney+ added all 13 seasons to the official MCU timeline.

Everything else Marvel Television produced is **not** canon. Those rows carry `is_mcu: false` and a `continuity` naming their own franchise or banner — never a generic "Marvel Television":

| Show | `continuity` |
|---|---|
| Agents of S.H.I.E.L.D. (7 seasons) | `Agents of S.H.I.E.L.D.` |
| Agent Carter (2 seasons) | `Agent Carter` |
| Runaways + Cloak & Dagger | `Marvel YA` — Marvel itself crossed them over and branded them an interconnected YA franchise |
| Helstrom | `Adventure into Fear` — the banner it was announced under |
| Inhumans | `Inhumans` |

Non-canon rows still keep `multiverse_designation: "Earth-616"` — deliberate: these productions explicitly depict Earth-616 events, no alternate reality number was ever assigned to them, and `is_mcu` + `continuity` already carry the non-canon signal. Canon status and in-fiction reality are separate questions — never conflate them in one field.

When canon status is unclear, the two tiebreakers are the **official Disney+ MCU timeline** and ***Marvel Studios' The Marvel Cinematic Universe: An Official Timeline*** (2023).

Non-canon titles still belong in the database — the FOX, Sony, and New Line continuities are all tracked — they just carry `is_mcu: false` and their own `continuity` value.

## Multiverse designation rules

**A designation is only used when Marvel — or a director of the title — actually stated it**: on screen, in an official publication, or in an interview. If it was never disclosed or discussed, the value is **`"Unknown"`**.

**Fan wikis are not a source.** Marvel Database / Fandom hand out reality numbers for practically every adaptation (`Earth-26320`, `Earth-701306`, `Earth-121698`, `Earth-58732`, `Earth-89521`, `Earth-86445`, …). None of those were said by Marvel or a filmmaker, so none go in the database — "the Appendix to the Handbook of the Marvel Universe is approved by Marvel editorial" is not good enough either.

**The database uses exactly four designations plus `"Unknown"`** — if about to write a fifth, that is almost certainly a wiki number; stop and find where Marvel or a director actually said it.

| Designation | Where it was stated |
|---|---|
| `Earth-616` | Said on screen in *No Way Home*; confirmed in the official timeline book |
| `Earth-838` | Said on screen in *Doctor Strange in the Multiverse of Madness* |
| `Earth-828` | On screen in *The Fantastic Four: First Steps*; confirmed by director Matt Shakman |
| `Earth-10005` | On the TVA screens in *Deadpool & Wolverine* |

Everything else that has shipped without a disclosed number is `"Unknown"`, and stays that way until Marvel says otherwise — currently every non-MCU continuity except the FOX X-Men:

| Continuity | Designation |
|---|---|
| MCU | `Earth-616` (plus `Earth-828` for *First Steps*, `Earth-838` for the DS2 Illuminati) |
| X-Men Universe | `Earth-10005` |
| Sony Spider-Man Universe | `Unknown` — includes the Raimi and Webb films and the Venom/Morbius/Madame Web/Kraven run |
| Blade Trilogy · FOX Daredevil · FOX Fantastic Four | `Unknown` |
| *Marvel Zombies*, *Your Friendly Neighborhood Spider-Man*, the Council of Kangs variants | `Unknown` |

`Earth-96283` (Raimi), `Earth-120703` (Webb), `Earth-26320`, `Earth-701306`, `Earth-121698`, `Earth-58732`, `Earth-89521` and `Earth-86445` were all removed for failing this bar — every one was a Marvel Database number.

## Origin vs. where they turned up

`characters.multiverse_designation` means **origin** — the reality a character is native to. Where they physically *are* during a given title is a different question, and the two diverge whenever someone crosses over.

That second question lives on the appearance: `character_appearances.multiverse_designation`, surfaced by the API as **`appeared_in`** on `/characters/movie/:id`, `/characters/tvshow/:id`, `/characters/:id/movies` and `/characters/:id/tvshows`.

**Null is the normal case and means "the same reality the title is set in"** — so `appeared_in` falls back to the *title's* designation, not the character's. A character in *The Fantastic Four: First Steps* is in Earth-828 because that is where the film happens. Only fill the column when someone is somewhere the title's own designation doesn't cover — the Void sequences in *Deadpool & Wolverine* being the clearest example.

It falls out correctly without any stored data in most cases:

| | origin | `appeared_in` |
|---|---|---|
| Reed Richards in *First Steps* | `Earth-828` | `Earth-828` |
| Reed Richards in *Doomsday* | `Earth-828` | `Earth-616` |
| Maguire's Peter in *No Way Home* | `Unknown` | `Earth-616` — visiting, not stranded |
