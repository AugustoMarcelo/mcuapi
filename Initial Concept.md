# MCU API Expansion Design: Multiverse, Studios & Characters

This document outlines the planned expansion of the MCU API to include content from other Marvel film universes (such as FOX's X-Men franchise), integrate the multiverse concept, and introduce a structured character model.  

---
## New Concepts

### 🏢 Real-World Studio vs. In-Universe Continuity

To avoid confusion between real-world production and in-universe timelines (especially with the introduction of the multiverse), we're introducing a few new fields:

| Field                    | Purpose                                                                          |
| ------------------------ | -------------------------------------------------------------------------------- |
| `studio`                 | Real-world production studio (e.g. `Marvel Studios`, `FOX`, `Sony`)              |
| `continuity`             | The story/branding group the title belongs to (e.g. `MCU`, `FOX X-Men Universe`) |
| `multiverse_designation` | Optional multiverse Earth ID (e.g., `Earth-616`, `Earth-838`)                    |
| `is_mcu`                 | Boolean flag to easily identify whether it's part of the official MCU            |

---

## Updated Movie/TV Show Entry Schema
 

```json

{

  "id": 201,

  "title": "Deadpool",

  "release_date": "2016-02-12",

  "type": "movie",

  "studio": "FOX",

  "continuity": "FOX X-Men Universe",

  "is_mcu": false,

  "multiverse_designation": "Earth-TRN414",

  "timeline": {

    "universe": "Earth-TRN414",

    "chronology_order": 2,

    "starts_at": "2016",

    "ends_at": "2016"

  },

  "overview": "...",

  "cover_url": "..."

}

```


---
## Chronology & Timeline Model

Each timeline entry (movie or show) is grouped by its in-universe multiverse designation. The `chronology_order` tracks its place in that continuity. 

### Sample `/timeline` Response


```json

[

  {

    "continuity": "MCU",

    "multiverse_designation": "Earth-616",

    "entries": [

      {

        "id": 1,

        "title": "Captain America: The First Avenger",

        "chronology_order": 1

      },

      ...

    ]

  },

  {

    "continuity": "FOX X-Men Universe",

    "multiverse_designation": "Earth-10005",

    "entries": [

      {

        "id": 301,

        "title": "X-Men: First Class",

        "chronology_order": 1

      }

    ]

  }

]

```
  
---

## Character Model (WIP)  

A new model for representing characters across different universes, variants, and relationships.
A list of characters appearances has been initialized on [[MCU Appearances List]]
The proposed schema can be checked here: [[proposed_characters_schema.json]]

---
## Character Endpoints (Proposed)

| Endpoint                         | Description             |
| -------------------------------- | ----------------------- |
| `GET /characters`                | List all characters     |
| `GET /characters/{id}`           | Get a single character  |
| `GET /characters?continuity=MCU` | Filter by continuity    |
| `GET /movies/{id}/characters`    | Characters in a movie   |
| `GET /tvshows/{id}/characters`   | Characters in a TV show |

---
## ✅ Filtering Examples

- `GET /movies?studio=FOX`
- `GET /shows?continuity=MCU`
- `GET /timeline?multiverse=Earth-10005`
- `GET /characters?multiverse_designation=Earth-838`
---
## 💡 Optional Future Enhancements

- `variant_of` reference for characters
- Cross-universe events (e.g., *Secret Wars*, *Multiversal Incursions*)
- Earth-level metadata endpoint: `/earths` or `/universes`  
---
## 🧠 Design Philosophy

- Separate **real-world production logic** from **in-universe canon** to avoid user confusion.
- Avoid using ambiguous terms like `universe` at the top level.
- Embrace the multiverse model to future-proof the API.
- Maintain backward compatibility (e.g., default `continuity=MCU` if not specified).

---
## 📚 References

- [MCU API Docs](https://mcuapi.up.railway.app/docs)
- [GitHub Issue #13](https://github.com/AugustoMarcelo/mcuapi/issues/13)
- [Marvel Multiverse Designations - Fandom](https://marvel.fandom.com/wiki/Multiverse)
- [ChatGPT Ideas](https://chatgpt.com/c/67f17edb-cc7c-8003-90b8-ed3816369b39)