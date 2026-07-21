# MCU API Multiverse Features

This document describes the new multiverse features that have been implemented in the MCU API, as outlined in the Initial Concept document.

## 🆕 New Features

### 1. Multiverse Fields for Movies and TV Shows

Both movies and TV shows now include the following new fields:

- `studio`: Real-world production studio (e.g., "Marvel Studios", "FOX", "Sony")
- `continuity`: The story/branding group the title belongs to (e.g., "MCU", "FOX X-Men Universe")
- `multiverse_designation`: Optional multiverse Earth ID (e.g., "Earth-616", "Earth-838")
- `is_mcu`: Boolean flag to easily identify whether it's part of the official MCU
- `type`: Content type ("movie" or "tvshow")

### 2. Timeline Fields

Both movies and TV shows now include timeline fields for chronological ordering:

- `timeline_universe`: The universe designation for timeline purposes
- `timeline_chronology_order`: The chronological order within that universe
- `timeline_starts_at`: When the story starts (year)
- `timeline_ends_at`: When the story ends (year)

### 3. Characters Module

A new Characters module has been implemented with the following features:

- Character management (CRUD operations)
- Character variants support (`variant_of` field)
- First appearance tracking (movie or TV show)
- Character appearances tracking through junction table
- Multiverse support for characters

### 4. Timeline Endpoint

A new `/api/v1/timeline` endpoint provides chronological ordering of content across different universes.

## 🔗 New API Endpoints

### Characters
- `GET /api/v1/characters` - List all characters
- `GET /api/v1/characters/:id` - Get a single character
- `POST /api/v1/characters` - Create a new character
- `PUT /api/v1/characters/:id` - Update a character
- `GET /api/v1/characters/movie/:movie_id` - Get characters in a movie
- `GET /api/v1/characters/tvshow/:tvshow_id` - Get characters in a TV show

### Timeline
- `GET /api/v1/timeline` - Get timeline across all universes
- `GET /api/v1/timeline?multiverse=Earth-616` - Get timeline for specific universe

## 🔍 Enhanced Filtering

### Movies and TV Shows
All existing endpoints now support additional filtering:

- `?studio=FOX` - Filter by production studio
- `?continuity=MCU` - Filter by continuity
- `?multiverse_designation=Earth-838` - Filter by multiverse designation
- `?is_mcu=true` - Filter for MCU content only

### Characters
- `?continuity=MCU` - Filter by continuity
- `?multiverse_designation=Earth-838` - Filter by multiverse designation

## 📊 Database Schema Changes

### New Tables
- `characters` - Character information
- `character_appearances` - Junction table for character appearances

### Updated Tables
- `movies` - Added multiverse and timeline fields
- `tvshows` - Added multiverse and timeline fields

## 🚀 Usage Examples

### Get all FOX movies
```
GET /api/v1/movies?studio=FOX
```

### Get MCU timeline
```
GET /api/v1/timeline?multiverse=Earth-616
```

### Get characters from a specific movie
```
GET /api/v1/characters/movie/1
```

### Get all characters from Earth-838
```
GET /api/v1/characters?multiverse_designation=Earth-838
```

## 🔧 Migration

To apply the database changes, run:

```bash
npm run typeorm migration:run
```

## 📝 Notes

- All new fields are optional and have sensible defaults
- Existing data will continue to work without modification
- The `is_mcu` field defaults to `true` for backward compatibility
- The `continuity` field defaults to "MCU" for backward compatibility
- The `type` field defaults to "movie" for movies and "tvshow" for TV shows

## 🎯 Design Philosophy

- Separate real-world production logic from in-universe canon
- Avoid ambiguous terms like "universe" at the top level
- Embrace the multiverse model to future-proof the API
- Maintain backward compatibility
- Support cross-universe character variants and relationships 