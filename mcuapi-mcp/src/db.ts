import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool, PoolClient } from 'pg';
import { invalidateApiCache } from './cache.js';

// Load env file from parent project (defaults to .env; override via MCP_ENV_FILE,
// e.g. '../../.env.production' to target Neon instead of local Postgres)
dotenv.config({
  path: path.resolve(__dirname, process.env.MCP_ENV_FILE || '../../.env'),
});

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'mcuapi',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    if (/^\s*(INSERT|UPDATE|DELETE)\b/i.test(sql)) {
      await invalidateApiCache();
    }
    return result.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Runs `fn` inside BEGIN/COMMIT on one held connection, rolling back on any
 * failure — for call sites that need a write plus a follow-up derived-state
 * update (e.g. a row insert plus a count sync) to succeed or fail together.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    await invalidateApiCache();
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
