# MCUAPI public MCP server

Read-only [Model Context Protocol](https://modelcontextprotocol.io/) server for [MCUAPI](https://mcuapi.up.railway.app/docs). It covers movies, TV shows, characters, people, post-credit scenes, timeline, upcoming releases, titles, search, stats, and health.

It uses [`mcuapi-client`](https://www.npmjs.com/package/mcuapi-client) to call the public API. It never connects to PostgreSQL and has no mutation tools.

## Requirements

Node.js 20 or later.

## Install

Run without installing globally:

```bash
npx -y mcuapi-mcp-public
```

## Stdio configuration

```json
{
  "mcpServers": {
    "mcuapi": {
      "command": "npx",
      "args": ["-y", "mcuapi-mcp-public"]
    }
  }
}
```

For a local API or test environment, set `MCUAPI_BASE_URL`:

```json
{
  "mcpServers": {
    "mcuapi": {
      "command": "npx",
      "args": ["-y", "mcuapi-mcp-public"],
      "env": {
        "MCUAPI_BASE_URL": "http://localhost:3333"
      }
    }
  }
}
```

Failures from the public API are returned as MCP tool errors with the API status and detail. The server never falls back to the static snapshot.
