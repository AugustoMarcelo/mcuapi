import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MCUAPI } from 'mcuapi-client';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const pageSchema = z.number().int().positive().optional();
const limitSchema = z.number().int().min(1).max(100).optional();
const idSchema = z.number().int().positive();

const listSchema = {
  page: pageSchema,
  limit: limitSchema,
  columns: z.string().optional(),
  order: z.string().optional(),
  filter: z.string().optional(),
};

const titleListSchema = {
  ...listSchema,
  studio: z.string().optional(),
  continuity: z.string().optional(),
  multiverse_designation: z.string().optional(),
  is_mcu: z.boolean().optional(),
};

const characterListSchema = {
  ...listSchema,
  continuity: z.string().optional(),
  multiverse_designation: z.string().optional(),
};

function text(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function relay(request: () => Promise<unknown>) {
  try {
    return text(await request());
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `MCUAPI request failed: ${errorMessage(error)}` }],
      isError: true,
    };
  }
}

export interface CreateServerOptions {
  baseUrl?: string;
}

export function createServer(options: CreateServerOptions = {}): McpServer {
  const client = new MCUAPI({ baseUrl: options.baseUrl ?? process.env.MCUAPI_BASE_URL });
  const server = new McpServer({ name: 'mcuapi-mcp-public', version: '1.0.0' });

  server.registerTool(
    'get_health',
    { description: 'Check public MCUAPI availability and database status.' },
    () => relay(() => client.health()),
  );

  server.registerTool(
    'list_movies',
    { description: 'List movies with pagination, field selection, sorting, and filters.', inputSchema: titleListSchema },
    params => relay(() => client.request(`/api/v1/movies${query(params)}`)),
  );
  server.registerTool(
    'get_movie',
    { description: 'Get one movie by ID.', inputSchema: { id: idSchema } },
    ({ id }) => relay(() => client.movies.get(id)),
  );
  server.registerTool(
    'get_movie_characters',
    { description: 'Get characters associated with one movie.', inputSchema: { movie_id: idSchema } },
    ({ movie_id }) => relay(() => client.movies.characters(movie_id)),
  );
  server.registerTool(
    'get_movie_post_credit_scenes',
    { description: 'Get post-credit scenes from one movie.', inputSchema: { movie_id: idSchema } },
    ({ movie_id }) => relay(() => client.movies.postCreditScenes(movie_id)),
  );

  server.registerTool(
    'list_tvshows',
    { description: 'List TV shows with pagination, field selection, sorting, and filters.', inputSchema: titleListSchema },
    params => relay(() => client.request(`/api/v1/tvshows${query(params)}`)),
  );
  server.registerTool(
    'get_tvshow',
    { description: 'Get one TV show by ID.', inputSchema: { id: idSchema } },
    ({ id }) => relay(() => client.tvshows.get(id)),
  );
  server.registerTool(
    'get_tvshow_characters',
    { description: 'Get characters associated with one TV show.', inputSchema: { tvshow_id: idSchema } },
    ({ tvshow_id }) => relay(() => client.tvshows.characters(tvshow_id)),
  );
  server.registerTool(
    'get_tvshow_post_credit_scenes',
    { description: 'Get post-credit scenes from one TV show.', inputSchema: { tvshow_id: idSchema } },
    ({ tvshow_id }) => relay(() => client.tvshows.postCreditScenes(tvshow_id)),
  );

  server.registerTool(
    'list_characters',
    { description: 'List characters with pagination, field selection, sorting, and filters.', inputSchema: characterListSchema },
    params => relay(() => client.request(`/api/v1/characters${query(params)}`)),
  );
  server.registerTool(
    'get_character',
    { description: 'Get one character by ID.', inputSchema: { id: idSchema } },
    ({ id }) => relay(() => client.characters.get(id)),
  );
  server.registerTool(
    'get_character_movies',
    { description: 'Get movies associated with one character.', inputSchema: { character_id: idSchema } },
    ({ character_id }) => relay(() => client.characters.movies(character_id)),
  );
  server.registerTool(
    'get_character_tvshows',
    { description: 'Get TV shows associated with one character.', inputSchema: { character_id: idSchema } },
    ({ character_id }) => relay(() => client.characters.tvshows(character_id)),
  );

  server.registerTool(
    'list_people',
    { description: 'List people with pagination, field selection, sorting, and filters.', inputSchema: listSchema },
    params => relay(() => client.request(`/api/v1/people${query(params)}`)),
  );
  server.registerTool(
    'get_person',
    { description: 'Get one person by ID.', inputSchema: { id: idSchema } },
    ({ id }) => relay(() => client.people.get(id)),
  );
  server.registerTool(
    'get_person_characters',
    { description: 'Get characters played by one person.', inputSchema: { person_id: idSchema } },
    ({ person_id }) => relay(() => client.people.characters(person_id)),
  );
  server.registerTool(
    'get_person_titles',
    { description: 'Get titles directed by one person.', inputSchema: { person_id: idSchema } },
    ({ person_id }) => relay(() => client.people.titles(person_id)),
  );

  server.registerTool(
    'list_post_credit_scenes',
    { description: 'List post-credit scenes with pagination, field selection, sorting, and filters.', inputSchema: listSchema },
    params => relay(() => client.request(`/api/v1/post-credit-scenes${query(params)}`)),
  );
  server.registerTool(
    'get_post_credit_scene',
    { description: 'Get one post-credit scene by ID.', inputSchema: { id: idSchema } },
    ({ id }) => relay(() => client.postCreditScenes.get(id)),
  );
  server.registerTool(
    'get_timeline',
    { description: 'Get chronological MCUAPI timeline groups, optionally for one multiverse.', inputSchema: { multiverse: z.string().optional() } },
    params => relay(() => client.timeline.get(params)),
  );
  server.registerTool(
    'list_upcoming',
    {
      description: 'List future movie and TV show releases.',
      inputSchema: {
        page: pageSchema,
        limit: limitSchema,
        type: z.enum(['movie', 'tvshow']).optional(),
        continuity: z.string().optional(),
        multiverse_designation: z.string().optional(),
        is_mcu: z.boolean().optional(),
      },
    },
    params => relay(() => client.upcoming.list(params)),
  );
  server.registerTool(
    'list_titles',
    {
      description: 'List movies and TV shows together with pagination, field selection, sorting, and filters.',
      inputSchema: { ...titleListSchema, type: z.enum(['movie', 'tvshow']).optional() },
    },
    params => relay(() => client.request(`/api/v1/titles${query(params)}`)),
  );
  server.registerTool(
    'search',
    {
      description: 'Search movies, TV shows, characters, and people.',
      inputSchema: {
        q: z.string().min(1),
        type: z.enum(['movie', 'tvshow', 'character', 'person']).optional(),
        page: pageSchema,
        limit: limitSchema,
      },
    },
    params => relay(() => client.search.list(params)),
  );
  server.registerTool(
    'get_stats',
    { description: 'Get dataset-wide MCUAPI counts and last-updated time.' },
    () => relay(() => client.stats.get()),
  );

  return server;
}

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}

async function main(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
