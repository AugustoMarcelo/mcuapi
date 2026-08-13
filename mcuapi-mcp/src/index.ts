import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { query } from './db.js';
import {
  applyCharacterDefaults,
  applyMovieDefaults,
  applyTVShowDefaults,
  validateEarth,
} from './rules.js';

const server = new McpServer({
  name: 'mcuapi',
  version: '1.0.0',
});

// ─── SEARCH ────────────────────────────────────────────────────────────────────

server.registerTool(
  'search_content',
  {
    description:
      'Search for movies, TV shows, or characters by title/name. Returns matching records.',
    inputSchema: {
      query: z.string().describe('Search text'),
      type: z
        .enum(['movie', 'tvshow', 'character', 'all'])
        .default('all')
        .describe('Type of content to search'),
      limit: z.number().int().min(1).max(50).default(10),
    },
  },
  async ({ query: q, type, limit }) => {
    const results: string[] = [];
    const param = `%${q}%`;

    if (type === 'movie' || type === 'all') {
      const movies = await query<{
        id: number;
        title: string;
        phase: number;
        continuity: string;
        multiverse_designation: string;
      }>(
        `SELECT id, title, phase, continuity, multiverse_designation FROM movies WHERE title ILIKE $1 LIMIT $2`,
        [param, limit],
      );
      if (movies.length > 0) {
        results.push('**Movies:**');
        movies.forEach(m =>
          results.push(
            `  [${m.id}] ${m.title} — Phase ${m.phase} | ${m.continuity} | ${m.multiverse_designation}`,
          ),
        );
      }
    }

    if (type === 'tvshow' || type === 'all') {
      const shows = await query<{
        id: number;
        title: string;
        phase: number;
        continuity: string;
      }>(
        `SELECT id, title, phase, continuity FROM tvshows WHERE title ILIKE $1 LIMIT $2`,
        [param, limit],
      );
      if (shows.length > 0) {
        results.push('**TV Shows:**');
        shows.forEach(s =>
          results.push(
            `  [${s.id}] ${s.title} — Phase ${s.phase} | ${s.continuity}`,
          ),
        );
      }
    }

    if (type === 'character' || type === 'all') {
      const chars = await query<{
        id: number;
        name: string;
        alias: string;
        continuity: string;
        multiverse_designation: string;
      }>(
        `SELECT id, name, alias, continuity, multiverse_designation FROM characters WHERE name ILIKE $1 OR alias ILIKE $1 LIMIT $2`,
        [param, limit],
      );
      if (chars.length > 0) {
        results.push('**Characters:**');
        chars.forEach(c =>
          results.push(
            `  [${c.id}] ${c.name}${c.alias ? ` (${c.alias})` : ''} — ${
              c.continuity
            } | ${c.multiverse_designation}`,
          ),
        );
      }
    }

    return {
      content: [
        {
          type: 'text',
          text:
            results.length > 0
              ? results.join('\n')
              : `No results found for "${q}"`,
        },
      ],
    };
  },
);

// ─── STATS ─────────────────────────────────────────────────────────────────────

server.registerTool(
  'get_stats',
  {
    description:
      'Get an overview of the database: counts, universes, phases, etc.',
  },
  async () => {
    const [movieCount] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM movies',
    );
    const [tvshowCount] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM tvshows',
    );
    const [charCount] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM characters',
    );
    const universes = await query<{
      multiverse_designation: string;
      continuity: string;
      count: string;
    }>(
      `SELECT multiverse_designation, continuity, COUNT(*) as count
       FROM (SELECT multiverse_designation, continuity FROM movies UNION ALL SELECT multiverse_designation, continuity FROM tvshows) combined
       WHERE multiverse_designation IS NOT NULL
       GROUP BY multiverse_designation, continuity
       ORDER BY count DESC`,
    );

    const lines = [
      '**MCU API Database Stats**',
      '',
      `Movies: ${movieCount.count}`,
      `TV Shows: ${tvshowCount.count}`,
      `Characters: ${charCount.count}`,
      '',
      '**Universes:**',
      ...universes.map(
        u =>
          `  ${u.multiverse_designation} (${u.continuity}): ${u.count} titles`,
      ),
    ];

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

server.registerTool(
  'get_usage_stats',
  {
    description:
      'API traffic: request counts per day and per route, from the request_metrics table. ' +
      'Counters are aggregate only — no IPs, user agents or query strings are stored. ' +
      'Note that Cache-Control means repeat callers may not reach the server at all, ' +
      'so these are a floor on real usage, not the exact figure.',
    inputSchema: {
      days: z
        .number()
        .int()
        .min(1)
        .max(365)
        .optional()
        .describe('How many days back to report. Defaults to 30.'),
    },
  },
  async ({ days }) => {
    const window = days ?? 30;

    const [totals] = await query<{ total: string; active_days: string }>(
      `SELECT COALESCE(SUM(count), 0) AS total, COUNT(DISTINCT day) AS active_days
       FROM request_metrics
       WHERE day >= CURRENT_DATE - $1::int`,
      [window],
    );

    if (!totals || Number(totals.total) === 0) {
      return {
        content: [
          {
            type: 'text',
            text:
              `**API usage — last ${window} days**\n\n` +
              'No requests recorded yet. If the API is deployed, either the ' +
              'migration has not run or no traffic has arrived since it did.',
          },
        ],
      };
    }

    const byRoute = await query<{ route: string; hits: string }>(
      `SELECT route, SUM(count) AS hits
       FROM request_metrics
       WHERE day >= CURRENT_DATE - $1::int
       GROUP BY route
       ORDER BY hits DESC
       LIMIT 20`,
      [window],
    );

    const byDay = await query<{ day: string; hits: string }>(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, SUM(count) AS hits
       FROM request_metrics
       WHERE day >= CURRENT_DATE - $1::int
       GROUP BY day
       ORDER BY day DESC
       LIMIT 14`,
      [window],
    );

    const byStatus = await query<{ status_class: number; hits: string }>(
      `SELECT status_class, SUM(count) AS hits
       FROM request_metrics
       WHERE day >= CURRENT_DATE - $1::int
       GROUP BY status_class
       ORDER BY status_class`,
      [window],
    );

    const total = Number(totals.total);
    const activeDays = Number(totals.active_days) || 1;

    const lines = [
      `**API usage — last ${window} days**`,
      '',
      `Total requests: ${total.toLocaleString('en-US')}`,
      `Days with traffic: ${activeDays}`,
      `Average per active day: ${Math.round(total / activeDays).toLocaleString('en-US')}`,
      '',
      '**By status class:**',
      ...byStatus.map(
        s => `  ${s.status_class}xx: ${Number(s.hits).toLocaleString('en-US')}`,
      ),
      '',
      '**Top routes:**',
      ...byRoute.map(r => `  ${r.route} — ${Number(r.hits).toLocaleString('en-US')}`),
      '',
      '**Recent days:**',
      ...byDay.map(d => `  ${d.day}: ${Number(d.hits).toLocaleString('en-US')}`),
    ];

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

// ─── MOVIES ────────────────────────────────────────────────────────────────────

server.registerTool(
  'create_movie',
  {
    description:
      'Create a new movie. Applies project defaults (studio=Marvel Studios, continuity=MCU, Earth-616) unless overridden.',
    inputSchema: {
      title: z.string(),
      release_date: z.string().optional().describe('YYYY-MM-DD'),
      phase: z.number().int().optional(),
      saga: z.string().optional(),
      chronology: z.number().int().optional(),
      duration: z.number().int().optional().describe('In minutes'),
      box_office: z.number().optional(),
      overview: z.string().optional(),
      cover_url: z.string().optional(),
      trailer_url: z.string().optional(),
      directed_by: z.string().optional(),
      post_credit_scenes: z.number().int().optional(),
      imdb_id: z.string().optional(),
      studio: z
        .string()
        .optional()
        .describe('e.g. "Marvel Studios", "FOX", "Sony"'),
      continuity: z
        .string()
        .optional()
        .describe('e.g. "MCU", "FOX X-Men Universe"'),
      multiverse_designation: z
        .string()
        .optional()
        .describe('e.g. "Earth-616", "Earth-10005"'),
      is_mcu: z.boolean().optional(),
      timeline_chronology_order: z.number().int().optional(),
    },
  },
  async input => {
    const data = applyMovieDefaults(input as Record<string, unknown>);

    const earthWarning = data.multiverse_designation
      ? validateEarth(data.multiverse_designation as string)
      : null;

    const fields = Object.keys(data).filter(k => data[k] !== undefined);
    const values = fields.map(k => data[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`);

    // movies.id has no sequence (ids are assigned manually in seeds)
    const [movie] = await query<{ id: number; title: string }>(
      `INSERT INTO movies (id, ${fields.join(
        ', ',
      )}, updated_at) VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM movies), ${placeholders.join(
        ', ',
      )}, NOW()) RETURNING id, title`,
      values,
    );

    const lines = [
      `✅ Movie created: [${movie.id}] ${movie.title}`,
      `   Studio: ${data.studio} | Continuity: ${data.continuity} | Earth: ${data.multiverse_designation}`,
    ];
    if (earthWarning) lines.push(`⚠️  ${earthWarning}`);

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

server.registerTool(
  'update_movie',
  {
    description:
      'Update an existing movie by ID. Only provided fields are updated.',
    inputSchema: {
      id: z.number().int().describe('Movie ID'),
      title: z.string().optional(),
      release_date: z.string().optional(),
      phase: z.number().int().optional(),
      saga: z.string().optional(),
      chronology: z.number().int().optional(),
      duration: z.number().int().optional(),
      box_office: z.number().optional(),
      overview: z.string().optional(),
      cover_url: z.string().optional(),
      trailer_url: z.string().optional(),
      directed_by: z.string().optional(),
      post_credit_scenes: z.number().int().optional(),
      imdb_id: z.string().optional(),
      studio: z.string().optional(),
      continuity: z.string().optional(),
      multiverse_designation: z.string().optional(),
      is_mcu: z.boolean().optional(),
      timeline_chronology_order: z.number().int().optional(),
    },
  },
  async ({ id, ...updates }) => {
    const fields = Object.keys(updates).filter(
      k => (updates as Record<string, unknown>)[k] !== undefined,
    );
    if (fields.length === 0) {
      return { content: [{ type: 'text', text: '⚠️ No fields to update.' }] };
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [
      ...fields.map(f => (updates as Record<string, unknown>)[f]),
      id,
    ];

    await query(
      `UPDATE movies SET ${setClause}, updated_at = NOW() WHERE id = $${
        fields.length + 1
      }`,
      values,
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ Movie [${id}] updated: ${fields.join(', ')}`,
        },
      ],
    };
  },
);

server.registerTool(
  'delete_movie',
  {
    description: 'Delete a movie by ID.',
    inputSchema: {
      id: z.number().int().describe('Movie ID'),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
  },
  async ({ id, confirm }) => {
    if (!confirm) {
      return {
        content: [
          {
            type: 'text',
            text: '⚠️ Set confirm=true to delete the movie.',
          },
        ],
      };
    }

    const [movie] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM movies WHERE id = $1',
      [id],
    );

    if (!movie) {
      return {
        content: [{ type: 'text', text: `❌ Movie [${id}] not found.` }],
      };
    }

    await query('DELETE FROM movies WHERE id = $1', [id]);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Movie [${id}] "${movie.title}" deleted.`,
        },
      ],
    };
  },
);

// ─── TV SHOWS ──────────────────────────────────────────────────────────────────

server.registerTool(
  'create_tvshow',
  {
    description:
      'Create a new TV show. Applies project defaults (studio=Marvel Studios, continuity=MCU, Earth-616) unless overridden.',
    inputSchema: {
      title: z.string(),
      release_date: z.string().optional().describe('YYYY-MM-DD'),
      last_aired_date: z.string().optional().describe('YYYY-MM-DD'),
      season: z.number().int().optional(),
      number_episodes: z.number().int().optional(),
      phase: z.number().int().optional(),
      saga: z.string().optional(),
      overview: z.string().optional(),
      cover_url: z.string().optional(),
      trailer_url: z.string().optional(),
      directed_by: z.string().optional(),
      imdb_id: z.string().optional(),
      studio: z.string().optional(),
      continuity: z.string().optional(),
      multiverse_designation: z.string().optional(),
      is_mcu: z.boolean().optional(),
      timeline_chronology_order: z.number().int().optional(),
    },
  },
  async input => {
    const data = applyTVShowDefaults(input as Record<string, unknown>);

    const fields = Object.keys(data).filter(k => data[k] !== undefined);
    const values = fields.map(k => data[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`);

    // tvshows.id has no sequence (ids are assigned manually in seeds)
    const [show] = await query<{ id: number; title: string }>(
      `INSERT INTO tvshows (id, ${fields.join(
        ', ',
      )}) VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM tvshows), ${placeholders.join(
        ', ',
      )}) RETURNING id, title`,
      values,
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ TV Show created: [${show.id}] ${show.title}\n   Studio: ${data.studio} | Continuity: ${data.continuity} | Earth: ${data.multiverse_designation}`,
        },
      ],
    };
  },
);

server.registerTool(
  'update_tvshow',
  {
    description:
      'Update an existing TV show by ID. Only provided fields are updated.',
    inputSchema: {
      id: z.number().int().describe('TV Show ID'),
      title: z.string().optional(),
      release_date: z.string().optional().describe('YYYY-MM-DD'),
      last_aired_date: z.string().optional().describe('YYYY-MM-DD'),
      season: z.number().int().optional(),
      number_episodes: z.number().int().optional(),
      phase: z.number().int().optional(),
      saga: z.string().optional(),
      overview: z.string().optional(),
      cover_url: z.string().optional(),
      trailer_url: z.string().optional(),
      directed_by: z.string().optional(),
      imdb_id: z.string().optional(),
      studio: z.string().optional(),
      continuity: z.string().optional(),
      multiverse_designation: z.string().optional(),
      is_mcu: z.boolean().optional(),
      timeline_chronology_order: z.number().int().optional(),
    },
  },
  async ({ id, ...updates }) => {
    const fields = Object.keys(updates).filter(
      k => (updates as Record<string, unknown>)[k] !== undefined,
    );
    if (fields.length === 0) {
      return { content: [{ type: 'text', text: '⚠️ No fields to update.' }] };
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [
      ...fields.map(f => (updates as Record<string, unknown>)[f]),
      id,
    ];

    const [show] = await query<{ id: number }>(
      'SELECT id FROM tvshows WHERE id = $1',
      [id],
    );
    if (!show) {
      return {
        content: [{ type: 'text', text: `❌ TV Show [${id}] not found.` }],
      };
    }

    await query(
      `UPDATE tvshows SET ${setClause} WHERE id = $${fields.length + 1}`,
      values,
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ TV Show [${id}] updated: ${fields.join(', ')}`,
        },
      ],
    };
  },
);

// ─── CHARACTERS ────────────────────────────────────────────────────────────────

server.registerTool(
  'create_character',
  {
    description: 'Create a new character. Defaults to MCU/Earth-616.',
    inputSchema: {
      name: z.string(),
      alias: z.string().optional().describe('Superhero alias'),
      description: z.string().optional(),
      image_url: z.string().optional(),
      played_by: z
        .string()
        .optional()
        .describe('Actor name(s), comma-separated for recasts'),
      continuity: z.string().optional().default('MCU'),
      multiverse_designation: z.string().optional().default('Earth-616'),
      variant_of: z
        .number()
        .int()
        .optional()
        .describe('ID of the character this is a variant of'),
      first_appearance_movie_id: z.number().int().optional(),
      first_appearance_tvshow_id: z.number().int().optional(),
    },
  },
  async input => {
    const data = applyCharacterDefaults(input as Record<string, unknown>);

    const earthWarning = data.multiverse_designation
      ? validateEarth(data.multiverse_designation as string)
      : null;

    // Validate variant_of exists
    if (data.variant_of) {
      const [base] = await query<{ id: number }>(
        'SELECT id FROM characters WHERE id = $1',
        [data.variant_of],
      );
      if (!base) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ variant_of character [${data.variant_of}] not found. Use search_content to find the correct ID.`,
            },
          ],
        };
      }
    }

    const fields = Object.keys(data).filter(k => data[k] !== undefined);
    const values = fields.map(k => data[k]);
    const placeholders = fields.map((_, i) => `$${i + 1}`);

    const [character] = await query<{ id: number; name: string }>(
      `INSERT INTO characters (${fields.join(
        ', ',
      )}, created_at, updated_at) VALUES (${placeholders.join(
        ', ',
      )}, NOW(), NOW()) RETURNING id, name`,
      values,
    );

    const lines = [
      `✅ Character created: [${character.id}] ${character.name}`,
      `   Continuity: ${data.continuity} | Earth: ${data.multiverse_designation}`,
    ];
    if (data.variant_of)
      lines.push(`   Variant of character [${data.variant_of}]`);
    if (earthWarning) lines.push(`⚠️  ${earthWarning}`);

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

server.registerTool(
  'update_character',
  {
    description: 'Update an existing character by ID.',
    inputSchema: {
      id: z.number().int().describe('Character ID'),
      name: z.string().optional(),
      alias: z.string().optional(),
      description: z.string().optional(),
      image_url: z.string().optional(),
      played_by: z.string().optional(),
      continuity: z.string().optional(),
      multiverse_designation: z.string().optional(),
      variant_of: z.number().int().optional(),
      first_appearance_movie_id: z.number().int().optional(),
      first_appearance_tvshow_id: z.number().int().optional(),
    },
  },
  async ({ id, ...updates }) => {
    const fields = Object.keys(updates).filter(
      k => (updates as Record<string, unknown>)[k] !== undefined,
    );
    if (fields.length === 0) {
      return { content: [{ type: 'text', text: '⚠️ No fields to update.' }] };
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [
      ...fields.map(f => (updates as Record<string, unknown>)[f]),
      id,
    ];

    await query(
      `UPDATE characters SET ${setClause}, updated_at = NOW() WHERE id = $${
        fields.length + 1
      }`,
      values,
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ Character [${id}] updated: ${fields.join(', ')}`,
        },
      ],
    };
  },
);

server.registerTool(
  'delete_tvshow',
  {
    description:
      'Delete a TV show by ID. Refuses if characters are still linked to it — unlink them first so the deletion never silently drops appearance rows.',
    inputSchema: {
      id: z.number().int().describe('TV Show ID'),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
  },
  async ({ id, confirm }) => {
    if (!confirm) {
      return {
        content: [
          { type: 'text', text: '⚠️ Set confirm=true to delete the TV show.' },
        ],
      };
    }

    const [show] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM tvshows WHERE id = $1',
      [id],
    );

    if (!show) {
      return { content: [{ type: 'text', text: `❌ TV Show [${id}] not found.` }] };
    }

    const [{ count }] = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM character_appearances WHERE tvshow_id = $1',
      [id],
    );

    if (Number(count) > 0) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ TV Show [${id}] "${show.title}" still has ${count} character appearance(s). Unlink them with delete_appearance first.`,
          },
        ],
      };
    }

    await query('DELETE FROM tvshows WHERE id = $1', [id]);

    return {
      content: [
        { type: 'text', text: `✅ TV Show [${id}] "${show.title}" deleted.` },
      ],
    };
  },
);

server.registerTool(
  'delete_character',
  {
    description: 'Delete a character by ID.',
    inputSchema: {
      id: z.number().int().describe('Character ID'),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
  },
  async ({ id, confirm }) => {
    if (!confirm) {
      return {
        content: [
          {
            type: 'text',
            text: '⚠️ Set confirm=true to delete the character.',
          },
        ],
      };
    }

    const [character] = await query<{ id: number; name: string }>(
      'SELECT id, name FROM characters WHERE id = $1',
      [id],
    );

    if (!character) {
      return {
        content: [{ type: 'text', text: `❌ Character [${id}] not found.` }],
      };
    }

    await query('DELETE FROM characters WHERE id = $1', [id]);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Character [${id}] "${character.name}" deleted.`,
        },
      ],
    };
  },
);

// ─── PEOPLE ────────────────────────────────────────────────────────────────────

server.registerTool(
  'create_person',
  {
    description:
      'Create a new person (real-world actor or director) who can be linked to characters or titles.',
    inputSchema: {
      name: z.string(),
    },
  },
  async ({ name }) => {
    const [person] = await query<{ id: number; name: string }>(
      'INSERT INTO people (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id, name',
      [name],
    );

    return {
      content: [
        { type: 'text', text: `✅ Person [${person.id}] "${person.name}" created.` },
      ],
    };
  },
);

const PERSON_UPDATABLE_FIELDS = ['name'] as const;

server.registerTool(
  'update_person',
  {
    description: 'Update an existing person by ID.',
    inputSchema: {
      id: z.number().int().describe('Person ID'),
      name: z.string().optional(),
    },
  },
  async ({ id, ...updates }) => {
    const fields = PERSON_UPDATABLE_FIELDS.filter(
      k => (updates as Record<string, unknown>)[k] !== undefined,
    );
    if (fields.length === 0) {
      return { content: [{ type: 'text', text: '⚠️ No fields to update.' }] };
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = [
      ...fields.map(f => (updates as Record<string, unknown>)[f]),
      id,
    ];

    const [person] = await query<{ id: number; name: string }>(
      `UPDATE people SET ${setClause}, updated_at = NOW() WHERE id = $${
        fields.length + 1
      } RETURNING id, name`,
      values,
    );

    if (!person) {
      return {
        content: [{ type: 'text', text: `❌ Person [${id}] not found.` }],
      };
    }

    return {
      content: [
        { type: 'text', text: `✅ Person [${person.id}] "${person.name}" updated.` },
      ],
    };
  },
);

server.registerTool(
  'delete_person',
  {
    description:
      'Delete a person by ID. Cascades to their person_characters and person_titles links.',
    inputSchema: {
      id: z.number().int().describe('Person ID'),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
  },
  async ({ id, confirm }) => {
    if (!confirm) {
      return {
        content: [
          { type: 'text', text: '⚠️ Set confirm=true to delete the person.' },
        ],
      };
    }

    const [person] = await query<{ id: number; name: string }>(
      'SELECT id, name FROM people WHERE id = $1',
      [id],
    );

    if (!person) {
      return {
        content: [{ type: 'text', text: `❌ Person [${id}] not found.` }],
      };
    }

    await query('DELETE FROM people WHERE id = $1', [id]);

    return {
      content: [
        { type: 'text', text: `✅ Person [${id}] "${person.name}" deleted.` },
      ],
    };
  },
);

server.registerTool(
  'link_person_character',
  {
    description:
      'Link a person to a character they played. recast_order is the in-story chronological position among the character\'s actors (1 is earliest) — required, since a wrong auto-default would silently corrupt data.',
    inputSchema: {
      person_id: z.number().int(),
      character_id: z.number().int(),
      recast_order: z
        .number()
        .int()
        .describe(
          "In-story chronological position among the character's actors; 1 is earliest.",
        ),
    },
  },
  async ({ person_id, character_id, recast_order }) => {
    const [person] = await query<{ id: number; name: string }>(
      'SELECT id, name FROM people WHERE id = $1',
      [person_id],
    );
    if (!person) {
      return {
        content: [{ type: 'text', text: `❌ Person [${person_id}] not found.` }],
      };
    }

    const [character] = await query<{ id: number; name: string }>(
      'SELECT id, name FROM characters WHERE id = $1',
      [character_id],
    );
    if (!character) {
      return {
        content: [
          { type: 'text', text: `❌ Character [${character_id}] not found.` },
        ],
      };
    }

    const [existing] = await query<{ id: number }>(
      'SELECT id FROM person_characters WHERE person_id = $1 AND character_id = $2',
      [person_id, character_id],
    );
    if (existing) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ ${person.name} is already linked to ${character.name}.`,
          },
        ],
      };
    }

    await query(
      'INSERT INTO person_characters (person_id, character_id, recast_order, created_at) VALUES ($1, $2, $3, NOW())',
      [person_id, character_id, recast_order],
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ Linked: ${person.name} → ${character.name} (recast_order ${recast_order})`,
        },
      ],
    };
  },
);

server.registerTool(
  'update_person_character',
  {
    description:
      'Update the recast_order of an existing person↔character link. Use this instead of link_person_character when the link already exists but its recast_order is wrong.',
    inputSchema: {
      person_id: z.number().int(),
      character_id: z.number().int(),
      recast_order: z.number().int(),
    },
  },
  async ({ person_id, character_id, recast_order }) => {
    const [existing] = await query<{ id: number }>(
      'SELECT id FROM person_characters WHERE person_id = $1 AND character_id = $2',
      [person_id, character_id],
    );

    if (!existing) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ No existing link found for person [${person_id}] and character [${character_id}]. Use link_person_character to create it.`,
          },
        ],
      };
    }

    await query('UPDATE person_characters SET recast_order = $1 WHERE id = $2', [
      recast_order,
      existing.id,
    ]);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Link [${existing.id}] updated: recast_order = ${recast_order}`,
        },
      ],
    };
  },
);

server.registerTool(
  'delete_person_character',
  {
    description: 'Delete a spurious person↔character link.',
    inputSchema: {
      person_id: z.number().int(),
      character_id: z.number().int(),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
  },
  async ({ person_id, character_id, confirm }) => {
    if (!confirm) {
      return {
        content: [{ type: 'text', text: '⚠️ Set confirm=true to delete the link.' }],
      };
    }

    const [existing] = await query<{ id: number }>(
      'SELECT id FROM person_characters WHERE person_id = $1 AND character_id = $2',
      [person_id, character_id],
    );

    if (!existing) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ No existing link found for person [${person_id}] and character [${character_id}].`,
          },
        ],
      };
    }

    await query('DELETE FROM person_characters WHERE id = $1', [existing.id]);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Link [${existing.id}] deleted (person [${person_id}], character [${character_id}]).`,
        },
      ],
    };
  },
);

interface ITitleTarget {
  column: 'movie_id' | 'tvshow_id';
  titleId: number;
}

// Shared by the three person_titles tools below — a row must have exactly
// one of movie_id/tvshow_id (PersonTitleExactlyOneTarget CHECK constraint),
// so this is validated once here rather than in each tool.
function resolveTitleTarget({
  movie_id,
  tvshow_id,
}: {
  movie_id?: number;
  tvshow_id?: number;
}): ITitleTarget | null {
  if (movie_id !== undefined && tvshow_id !== undefined) return null;
  if (movie_id !== undefined) return { column: 'movie_id', titleId: movie_id };
  if (tvshow_id !== undefined) return { column: 'tvshow_id', titleId: tvshow_id };
  return null;
}

server.registerTool(
  'link_person_title',
  {
    description:
      'Link a person to a movie or TV show with a role (defaults to "director", the only value the original backfill produced).',
    inputSchema: {
      person_id: z.number().int(),
      movie_id: z.number().int().optional(),
      tvshow_id: z.number().int().optional(),
      role: z.string().default('director'),
    },
  },
  async ({ person_id, movie_id, tvshow_id, role }) => {
    const target = resolveTitleTarget({ movie_id, tvshow_id });
    if (!target) {
      return {
        content: [
          { type: 'text', text: '❌ Provide either movie_id or tvshow_id.' },
        ],
      };
    }

    const [person] = await query<{ id: number; name: string }>(
      'SELECT id, name FROM people WHERE id = $1',
      [person_id],
    );
    if (!person) {
      return {
        content: [{ type: 'text', text: `❌ Person [${person_id}] not found.` }],
      };
    }

    const titleTable = target.column === 'movie_id' ? 'movies' : 'tvshows';
    const [titleRow] = await query<{ id: number; title: string }>(
      `SELECT id, title FROM ${titleTable} WHERE id = $1`,
      [target.titleId],
    );
    if (!titleRow) {
      const label = target.column === 'movie_id' ? 'Movie' : 'TV Show';
      return {
        content: [
          { type: 'text', text: `❌ ${label} [${target.titleId}] not found.` },
        ],
      };
    }

    const [existing] = await query<{ id: number }>(
      `SELECT id FROM person_titles WHERE person_id = $1 AND ${target.column} = $2`,
      [person_id, target.titleId],
    );
    if (existing) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ ${person.name} is already linked to "${titleRow.title}".`,
          },
        ],
      };
    }

    await query(
      `INSERT INTO person_titles (person_id, ${target.column}, role, created_at) VALUES ($1, $2, $3, NOW())`,
      [person_id, target.titleId, role],
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ Linked: ${person.name} → "${titleRow.title}" as ${role}`,
        },
      ],
    };
  },
);

server.registerTool(
  'update_person_title',
  {
    description:
      'Update the role of an existing person↔title link. Use this instead of link_person_title when the link already exists but its role is wrong.',
    inputSchema: {
      person_id: z.number().int(),
      movie_id: z.number().int().optional(),
      tvshow_id: z.number().int().optional(),
      role: z.string(),
    },
  },
  async ({ person_id, movie_id, tvshow_id, role }) => {
    const target = resolveTitleTarget({ movie_id, tvshow_id });
    if (!target) {
      return {
        content: [
          { type: 'text', text: '❌ Provide either movie_id or tvshow_id.' },
        ],
      };
    }

    const [existing] = await query<{ id: number }>(
      `SELECT id FROM person_titles WHERE person_id = $1 AND ${target.column} = $2`,
      [person_id, target.titleId],
    );

    if (!existing) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ No existing link found for person [${person_id}] on ${target.column} [${target.titleId}]. Use link_person_title to create it.`,
          },
        ],
      };
    }

    await query('UPDATE person_titles SET role = $1 WHERE id = $2', [
      role,
      existing.id,
    ]);

    return {
      content: [
        { type: 'text', text: `✅ Link [${existing.id}] updated: role = ${role}` },
      ],
    };
  },
);

server.registerTool(
  'delete_person_title',
  {
    description: 'Delete a spurious person↔title link.',
    inputSchema: {
      person_id: z.number().int(),
      movie_id: z.number().int().optional(),
      tvshow_id: z.number().int().optional(),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
  },
  async ({ person_id, movie_id, tvshow_id, confirm }) => {
    const target = resolveTitleTarget({ movie_id, tvshow_id });
    if (!target) {
      return {
        content: [
          { type: 'text', text: '❌ Provide either movie_id or tvshow_id.' },
        ],
      };
    }
    if (!confirm) {
      return {
        content: [{ type: 'text', text: '⚠️ Set confirm=true to delete the link.' }],
      };
    }

    const [existing] = await query<{ id: number }>(
      `SELECT id FROM person_titles WHERE person_id = $1 AND ${target.column} = $2`,
      [person_id, target.titleId],
    );

    if (!existing) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ No existing link found for person [${person_id}] on ${target.column} [${target.titleId}].`,
          },
        ],
      };
    }

    await query('DELETE FROM person_titles WHERE id = $1', [existing.id]);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Link [${existing.id}] deleted (person [${person_id}], ${target.column} [${target.titleId}]).`,
        },
      ],
    };
  },
);

// ─── APPEARANCES ───────────────────────────────────────────────────────────────

server.registerTool(
  'link_appearance',
  {
    description:
      'Link a character to a movie or TV show with a role type. Set multiverse_designation ONLY when the character is somewhere other than the reality the title itself is set in (e.g. the Void in Deadpool & Wolverine) — leaving it null means "same as the title", which is the normal case.',
    inputSchema: {
      character_id: z.number().int(),
      movie_id: z.number().int().optional(),
      tvshow_id: z.number().int().optional(),
      role_type: z.enum(['main', 'supporting', 'cameo']).default('main'),
      multiverse_designation: z
        .string()
        .optional()
        .describe(
          'Reality the character was in for THIS title. Omit unless it differs from the title.',
        ),
    },
  },
  async ({
    character_id,
    movie_id,
    tvshow_id,
    role_type,
    multiverse_designation,
  }) => {
    if (!movie_id && !tvshow_id) {
      return {
        content: [
          { type: 'text', text: '❌ Provide either movie_id or tvshow_id.' },
        ],
      };
    }

    const [character] = await query<{ id: number; name: string }>(
      'SELECT id, name FROM characters WHERE id = $1',
      [character_id],
    );
    if (!character) {
      return {
        content: [
          { type: 'text', text: `❌ Character [${character_id}] not found.` },
        ],
      };
    }

    let title = '';
    if (movie_id) {
      const [movie] = await query<{ id: number; title: string }>(
        'SELECT id, title FROM movies WHERE id = $1',
        [movie_id],
      );
      if (!movie)
        return {
          content: [
            { type: 'text', text: `❌ Movie [${movie_id}] not found.` },
          ],
        };
      title = movie.title;

      // Table has no unique constraint on (character_id, movie_id) —
      // check first so repeated calls don't accumulate duplicate links
      const [existing] = await query<{ id: number }>(
        'SELECT id FROM character_appearances WHERE character_id = $1 AND movie_id = $2',
        [character_id, movie_id],
      );
      if (existing) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ ${character.name} is already linked to "${title}".`,
            },
          ],
        };
      }

      await query(
        'INSERT INTO character_appearances (character_id, movie_id, role_type, multiverse_designation) VALUES ($1, $2, $3, $4)',
        [character_id, movie_id, role_type, multiverse_designation ?? null],
      );
    } else if (tvshow_id) {
      const [show] = await query<{ id: number; title: string }>(
        'SELECT id, title FROM tvshows WHERE id = $1',
        [tvshow_id],
      );
      if (!show)
        return {
          content: [
            { type: 'text', text: `❌ TV Show [${tvshow_id}] not found.` },
          ],
        };
      title = show.title;

      const [existing] = await query<{ id: number }>(
        'SELECT id FROM character_appearances WHERE character_id = $1 AND tvshow_id = $2',
        [character_id, tvshow_id],
      );
      if (existing) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ ${character.name} is already linked to "${title}".`,
            },
          ],
        };
      }

      await query(
        'INSERT INTO character_appearances (character_id, tvshow_id, role_type, multiverse_designation) VALUES ($1, $2, $3, $4)',
        [character_id, tvshow_id, role_type, multiverse_designation ?? null],
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Linked: ${character.name} → "${title}" as ${role_type}${
            multiverse_designation ? ` (in ${multiverse_designation})` : ''
          }`,
        },
      ],
    };
  },
);

server.registerTool(
  'update_appearance',
  {
    description:
      'Update an existing character appearance (movie or TV show link). Use this instead of link_appearance when the link already exists but its role_type or multiverse_designation is wrong. Pass an empty string for multiverse_designation to clear it back to "same reality as the title".',
    inputSchema: {
      character_id: z.number().int(),
      movie_id: z.number().int().optional(),
      tvshow_id: z.number().int().optional(),
      role_type: z.enum(['main', 'supporting', 'cameo']).optional(),
      multiverse_designation: z
        .string()
        .optional()
        .describe(
          'Reality the character was in for THIS title. Empty string clears it.',
        ),
    },
  },
  async ({
    character_id,
    movie_id,
    tvshow_id,
    role_type,
    multiverse_designation,
  }) => {
    if (!movie_id && !tvshow_id) {
      return {
        content: [
          { type: 'text', text: '❌ Provide either movie_id or tvshow_id.' },
        ],
      };
    }

    const column = movie_id ? 'movie_id' : 'tvshow_id';
    const titleId = movie_id ?? tvshow_id;

    const [existing] = await query<{ id: number }>(
      `SELECT id FROM character_appearances WHERE character_id = $1 AND ${column} = $2`,
      [character_id, titleId],
    );

    if (!existing) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ No existing appearance found for character [${character_id}] on ${column} [${titleId}]. Use link_appearance to create it.`,
          },
        ],
      };
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    const changed: string[] = [];

    if (role_type !== undefined) {
      sets.push(`role_type = $${sets.length + 1}`);
      values.push(role_type);
      changed.push(`role_type = ${role_type}`);
    }

    if (multiverse_designation !== undefined) {
      // Empty string is the explicit "clear it" signal — null means
      // "same reality as the title", which is the column's default meaning.
      const value = multiverse_designation === '' ? null : multiverse_designation;
      sets.push(`multiverse_designation = $${sets.length + 1}`);
      values.push(value);
      changed.push(`multiverse_designation = ${value ?? 'null (same as title)'}`);
    }

    if (sets.length === 0) {
      return { content: [{ type: 'text', text: '⚠️ No fields to update.' }] };
    }

    values.push(existing.id);
    await query(
      `UPDATE character_appearances SET ${sets.join(', ')} WHERE id = $${values.length}`,
      values,
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ Appearance [${existing.id}] updated: ${changed.join(', ')}`,
        },
      ],
    };
  },
);

server.registerTool(
  'delete_appearance',
  {
    description:
      'Delete a spurious character appearance link (a character wrongly linked to a movie or TV show they never appeared in).',
    inputSchema: {
      character_id: z.number().int(),
      movie_id: z.number().int().optional(),
      tvshow_id: z.number().int().optional(),
      confirm: z.boolean().describe('Must be true to confirm deletion'),
    },
  },
  async ({ character_id, movie_id, tvshow_id, confirm }) => {
    if (!movie_id && !tvshow_id) {
      return {
        content: [
          { type: 'text', text: '❌ Provide either movie_id or tvshow_id.' },
        ],
      };
    }
    if (!confirm) {
      return {
        content: [
          { type: 'text', text: '⚠️ Set confirm=true to delete the appearance.' },
        ],
      };
    }

    const column = movie_id ? 'movie_id' : 'tvshow_id';
    const titleId = movie_id ?? tvshow_id;

    const [existing] = await query<{ id: number }>(
      `SELECT id FROM character_appearances WHERE character_id = $1 AND ${column} = $2`,
      [character_id, titleId],
    );

    if (!existing) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ No existing appearance found for character [${character_id}] on ${column} [${titleId}].`,
          },
        ],
      };
    }

    await query('DELETE FROM character_appearances WHERE id = $1', [existing.id]);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Appearance [${existing.id}] deleted (character [${character_id}], ${column} [${titleId}]).`,
        },
      ],
    };
  },
);

server.registerTool(
  'link_related_content',
  {
    description: 'Link a movie to a TV show as related/tie-in content (bidirectional).',
    inputSchema: {
      movie_id: z.number().int(),
      tvshow_id: z.number().int(),
    },
  },
  async ({ movie_id, tvshow_id }) => {
    const [movie] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM movies WHERE id = $1',
      [movie_id],
    );
    if (!movie) {
      return {
        content: [
          { type: 'text', text: `❌ Movie [${movie_id}] not found.` },
        ],
      };
    }

    const [show] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM tvshows WHERE id = $1',
      [tvshow_id],
    );
    if (!show) {
      return {
        content: [
          { type: 'text', text: `❌ TV Show [${tvshow_id}] not found.` },
        ],
      };
    }

    const [existing] = await query<{ movie_id: number }>(
      'SELECT movie_id FROM related_content WHERE movie_id = $1 AND tvshow_id = $2',
      [movie_id, tvshow_id],
    );
    if (existing) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ "${movie.title}" is already linked to "${show.title}".`,
          },
        ],
      };
    }

    await query(
      'INSERT INTO related_content (movie_id, tvshow_id) VALUES ($1, $2)',
      [movie_id, tvshow_id],
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ Linked: "${movie.title}" ↔ "${show.title}"`,
        },
      ],
    };
  },
);

server.registerTool(
  'link_related_movies',
  {
    description: 'Link two movies as related content (bidirectional).',
    inputSchema: {
      movie_id: z.number().int(),
      related_movie_id: z.number().int(),
    },
  },
  async ({ movie_id, related_movie_id }) => {
    const [movie] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM movies WHERE id = $1',
      [movie_id],
    );
    if (!movie) {
      return {
        content: [
          { type: 'text', text: `❌ Movie [${movie_id}] not found.` },
        ],
      };
    }

    const [related] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM movies WHERE id = $1',
      [related_movie_id],
    );
    if (!related) {
      return {
        content: [
          { type: 'text', text: `❌ Movie [${related_movie_id}] not found.` },
        ],
      };
    }

    const [forward] = await query<{ movie_id: number }>(
      'SELECT movie_id FROM related_movies WHERE movie_id = $1 AND related_movie_id = $2',
      [movie_id, related_movie_id],
    );
    if (!forward) {
      await query(
        'INSERT INTO related_movies (movie_id, related_movie_id) VALUES ($1, $2)',
        [movie_id, related_movie_id],
      );
    }

    const [backward] = await query<{ movie_id: number }>(
      'SELECT movie_id FROM related_movies WHERE movie_id = $1 AND related_movie_id = $2',
      [related_movie_id, movie_id],
    );
    if (!backward) {
      await query(
        'INSERT INTO related_movies (movie_id, related_movie_id) VALUES ($1, $2)',
        [related_movie_id, movie_id],
      );
    }

    if (forward && backward) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ "${movie.title}" is already linked to "${related.title}".`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Linked: "${movie.title}" ↔ "${related.title}"`,
        },
      ],
    };
  },
);

server.registerTool(
  'link_related_tvshows',
  {
    description: 'Link two TV shows as related content (bidirectional).',
    inputSchema: {
      tvshow_id: z.number().int(),
      related_tvshow_id: z.number().int(),
    },
  },
  async ({ tvshow_id, related_tvshow_id }) => {
    const [tvshow] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM tvshows WHERE id = $1',
      [tvshow_id],
    );
    if (!tvshow) {
      return {
        content: [
          { type: 'text', text: `❌ TV Show [${tvshow_id}] not found.` },
        ],
      };
    }

    const [related] = await query<{ id: number; title: string }>(
      'SELECT id, title FROM tvshows WHERE id = $1',
      [related_tvshow_id],
    );
    if (!related) {
      return {
        content: [
          { type: 'text', text: `❌ TV Show [${related_tvshow_id}] not found.` },
        ],
      };
    }

    const [forward] = await query<{ tvshow_id: number }>(
      'SELECT tvshow_id FROM related_tvshows WHERE tvshow_id = $1 AND related_tvshow_id = $2',
      [tvshow_id, related_tvshow_id],
    );
    if (!forward) {
      await query(
        'INSERT INTO related_tvshows (tvshow_id, related_tvshow_id) VALUES ($1, $2)',
        [tvshow_id, related_tvshow_id],
      );
    }

    const [backward] = await query<{ tvshow_id: number }>(
      'SELECT tvshow_id FROM related_tvshows WHERE tvshow_id = $1 AND related_tvshow_id = $2',
      [related_tvshow_id, tvshow_id],
    );
    if (!backward) {
      await query(
        'INSERT INTO related_tvshows (tvshow_id, related_tvshow_id) VALUES ($1, $2)',
        [related_tvshow_id, tvshow_id],
      );
    }

    if (forward && backward) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ "${tvshow.title}" is already linked to "${related.title}".`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Linked: "${tvshow.title}" ↔ "${related.title}"`,
        },
      ],
    };
  },
);

// ─── BULK IMPORT ───────────────────────────────────────────────────────────────

server.registerTool(
  'bulk_import_characters',
  {
    description:
      'Import multiple characters at once from a JSON array. Each item should have at minimum a "name" field.',
    inputSchema: {
      characters: z
        .array(
          z.object({
            name: z.string(),
            alias: z.string().optional(),
            description: z.string().optional(),
            image_url: z.string().optional(),
            played_by: z.string().optional(),
            continuity: z.string().optional(),
            multiverse_designation: z.string().optional(),
            variant_of: z.number().int().optional(),
            first_appearance_movie_id: z.number().int().optional(),
            first_appearance_tvshow_id: z.number().int().optional(),
          }),
        )
        .describe('Array of character objects to insert'),
    },
  },
  async ({ characters }) => {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const char of characters) {
      try {
        const data = applyCharacterDefaults(char as Record<string, unknown>);
        const fields = Object.keys(data).filter(k => data[k] !== undefined);
        const values = fields.map(k => data[k]);
        const placeholders = fields.map((_, i) => `$${i + 1}`);

        await query(
          `INSERT INTO characters (${fields.join(
            ', ',
          )}, created_at, updated_at) VALUES (${placeholders.join(
            ', ',
          )}, NOW(), NOW())`,
          values,
        );
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(
          `${char.name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    const lines = [
      `✅ Imported ${results.success}/${characters.length} characters`,
    ];
    if (results.errors.length > 0) {
      lines.push('', '**Errors:**');
      results.errors.forEach(e => lines.push(`  - ${e}`));
    }

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

// ─── TIMELINE ──────────────────────────────────────────────────────────────────

server.registerTool(
  'get_timeline',
  {
    description: 'Get the chronological timeline grouped by universe.',
    inputSchema: {
      multiverse: z
        .string()
        .optional()
        .describe('Filter by Earth designation, e.g. "Earth-616"'),
      limit: z.number().int().min(1).max(100).default(20),
    },
  },
  async ({ multiverse, limit }) => {
    const movieWhere = multiverse ? 'WHERE multiverse_designation = $1' : '';
    const showWhere = multiverse ? 'WHERE multiverse_designation = $1' : '';
    const params = multiverse ? [multiverse, limit] : [limit];
    const limitParam = multiverse ? '$2' : '$1';

    const entries = await query<{
      id: number;
      title: string;
      type: string;
      continuity: string;
      multiverse_designation: string;
      timeline_chronology_order: number;
    }>(
      `SELECT id, title, type, continuity, multiverse_designation, timeline_chronology_order
       FROM (
         SELECT id, title, type, continuity, multiverse_designation, timeline_chronology_order FROM movies ${movieWhere}
         UNION ALL
         SELECT id, title, type, continuity, multiverse_designation, timeline_chronology_order FROM tvshows ${showWhere}
       ) combined
       WHERE timeline_chronology_order IS NOT NULL
       ORDER BY multiverse_designation, timeline_chronology_order
       LIMIT ${limitParam}`,
      params,
    );

    if (entries.length === 0) {
      return {
        content: [{ type: 'text', text: 'No timeline entries found.' }],
      };
    }

    // Group by universe
    const groups = new Map<string, typeof entries>();
    for (const entry of entries) {
      const key = `${entry.continuity} (${entry.multiverse_designation})`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }

    const lines: string[] = ['**Multiverse Timeline**', ''];
    for (const [universe, items] of groups) {
      lines.push(`**${universe}**`);
      items.forEach(e =>
        lines.push(`  ${e.timeline_chronology_order}. [${e.type}] ${e.title}`),
      );
      lines.push('');
    }

    return { content: [{ type: 'text', text: lines.join('\n') }] };
  },
);

// ─── START ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
