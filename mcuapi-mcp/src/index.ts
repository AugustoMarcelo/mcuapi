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
      timeline_universe: z.string().optional(),
      timeline_chronology_order: z.number().int().optional(),
      timeline_starts_at: z.string().optional(),
      timeline_ends_at: z.string().optional(),
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
      timeline_universe: z.string().optional(),
      timeline_chronology_order: z.number().int().optional(),
      timeline_starts_at: z.string().optional(),
      timeline_ends_at: z.string().optional(),
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
      timeline_universe: z.string().optional(),
      timeline_chronology_order: z.number().int().optional(),
      timeline_starts_at: z.string().optional(),
      timeline_ends_at: z.string().optional(),
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

// ─── APPEARANCES ───────────────────────────────────────────────────────────────

server.registerTool(
  'link_appearance',
  {
    description: 'Link a character to a movie or TV show with a role type.',
    inputSchema: {
      character_id: z.number().int(),
      movie_id: z.number().int().optional(),
      tvshow_id: z.number().int().optional(),
      role_type: z.enum(['main', 'supporting', 'cameo']).default('main'),
    },
  },
  async ({ character_id, movie_id, tvshow_id, role_type }) => {
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
        'INSERT INTO character_appearances (character_id, movie_id, role_type) VALUES ($1, $2, $3)',
        [character_id, movie_id, role_type],
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
        'INSERT INTO character_appearances (character_id, tvshow_id, role_type) VALUES ($1, $2, $3)',
        [character_id, tvshow_id, role_type],
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Linked: ${character.name} → "${title}" as ${role_type}`,
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
      timeline_starts_at: string;
    }>(
      `SELECT id, title, type, continuity, multiverse_designation, timeline_chronology_order, timeline_starts_at
       FROM (
         SELECT id, title, type, continuity, multiverse_designation, timeline_chronology_order, timeline_starts_at FROM movies ${movieWhere}
         UNION ALL
         SELECT id, title, type, continuity, multiverse_designation, timeline_chronology_order, timeline_starts_at FROM tvshows ${showWhere}
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
        lines.push(
          `  ${e.timeline_chronology_order}. [${e.type}] ${e.title}${
            e.timeline_starts_at ? ` (${e.timeline_starts_at})` : ''
          }`,
        ),
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
