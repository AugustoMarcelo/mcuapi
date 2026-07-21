# MCU API — Setup Guide

How to run the full stack: API backend, Nexus Dashboard, and the MCP server for Claude Code.

---

## 1. Database

Start PostgreSQL via Docker:

```bash
docker-compose up -d
```

This starts Postgres on port **5432** with:
- Database: `mcuapi`
- User: `postgres`
- Password: `postgres`

Create a `.env` file at the project root (copy from `.env.example` if present):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=mcuapi
```

---

## 2. API Backend (mcuapi)

```bash
# Install dependencies
yarn

# Run migrations
yarn typeorm:dev migration:run

# Seed initial data
yarn seed:run:dev

# Start development server (port 3333)
yarn dev:server
```

The API will be available at `http://localhost:3333`.

Swagger docs: `http://localhost:3333/api-docs`

---

## 3. Nexus Dashboard

Located at `/home/marcelo/Documents/Projects/nexus-dashboard/`.

```bash
cd ../nexus-dashboard

# Install dependencies (first time only)
npm install

# Start dev server (port 5173)
npm run dev
```

Open `http://localhost:5173`.

The dashboard proxies all `/api` requests to `http://localhost:3333`, so the API must be running.

### Pages
| Route | Description |
|---|---|
| `/` | Overview — stats + recent movies |
| `/movies` | Movies list with search, phase/continuity filters |
| `/tvshows` | TV Shows list |
| `/characters` | Characters list with delete and search |
| `/characters/new` | Create new character form |
| `/timeline` | Multiverse timeline — lane view per universe |

---

## 4. MCP Server (Claude Code integration)

The MCP server lets you manage data via natural language directly in Claude Code.

### First-time setup

```bash
cd mcuapi-mcp
npm install
npm run build
```

### Activation

A `.mcp.json` file already exists at the project root pointing to the built server:

```json
{
  "mcpServers": {
    "mcuapi": {
      "type": "stdio",
      "command": "node",
      "args": ["mcuapi-mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Code — the MCP server activates automatically when you open this project.

### Available tools

| Tool | What it does |
|---|---|
| `search_content` | Search movies, tvshows, or characters by text |
| `get_stats` | Database overview — counts per type, universes, phases |
| `create_movie` | Create a movie (applies MCU defaults automatically) |
| `update_movie` | Update a movie by ID |
| `create_tvshow` | Create a TV show |
| `create_character` | Create a character with validation |
| `update_character` | Update a character by ID |
| `delete_character` | Delete a character by ID |
| `link_appearance` | Link a character to a movie or TV show |
| `bulk_import_characters` | Import multiple characters from a JSON array |
| `get_timeline` | View the chronological timeline, optionally filtered by Earth |

### Example usage in Claude Code

```
Search for "Iron Man" across all content
Create a character named "Doctor Doom" in the MCU, Earth-616
Link character 5 to movie 22 as a main role
Show me the timeline for Earth-616
Import these characters: [{"name":"Wolverine","continuity":"FOX X-Men Universe",...}]
```

### Project rules enforced by the MCP
- `studio` defaults to `'Marvel Studios'` for MCU content
- `continuity` defaults to `'MCU'`
- `is_mcu` is set to `true` when `continuity='MCU'`
- Earth designations are validated against known values
- `variant_of` foreign key is validated before insert

### Rebuilding after changes

```bash
cd mcuapi-mcp
npm run build
```

Then restart Claude Code to reload the server.

---

## Quick start (all three together)

```bash
# Terminal 1 — Database
docker-compose up -d

# Terminal 2 — API
yarn dev:server

# Terminal 3 — Dashboard
cd ../nexus-dashboard && npm run dev
```

Then open Claude Code in the `mcuapi` directory — the MCP activates automatically.
