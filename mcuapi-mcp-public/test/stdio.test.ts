import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { createInterface } from 'node:readline';
import type { AddressInfo } from 'node:net';

interface RpcResponse {
  id: number;
  result?: unknown;
}

interface ToolCallResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

class McpSession {
  private readonly child;

  private readonly responses: RpcResponse[] = [];

  private readonly waiters: Array<(response: RpcResponse) => void> = [];

  private nextId = 1;

  constructor(baseUrl: string) {
    this.child = spawn(process.execPath, ['node_modules/.bin/tsx', 'src/index.ts'], {
      cwd: process.cwd(),
      env: { ...process.env, MCUAPI_BASE_URL: baseUrl },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    createInterface({ input: this.child.stdout }).on('line', line => {
      const message = JSON.parse(line) as RpcResponse;
      if (typeof message.id !== 'number') return;
      const waiter = this.waiters.shift();
      if (waiter) waiter(message);
      else this.responses.push(message);
    });
  }

  async initialize(): Promise<void> {
    await this.request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'test', version: '1.0.0' },
    });
    this.child.stdin.write(`${JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {},
    })}\n`);
  }

  async request(method: string, params: unknown): Promise<unknown> {
    const id = this.nextId;
    this.nextId += 1;
    const response = this.responses.shift();
    const result = response
      ? Promise.resolve(response)
      : new Promise<RpcResponse>(resolve => this.waiters.push(resolve));
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    return (await result).result;
  }

  async close(): Promise<void> {
    this.child.kill();
    await once(this.child, 'exit');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function tools(result: unknown): Array<{ name: string }> {
  assert.ok(isRecord(result));
  assert.ok(Array.isArray(result.tools));
  return result.tools.map(tool => {
    assert.ok(isRecord(tool));
    assert.ok(typeof tool.name === 'string');
    return { name: tool.name };
  });
}

function toolResult(result: unknown): ToolCallResult {
  assert.ok(isRecord(result));
  assert.ok(Array.isArray(result.content));
  const content = result.content.map(item => {
    assert.ok(isRecord(item));
    assert.ok(typeof item.type === 'string');
    assert.ok(typeof item.text === 'string');
    return { type: item.type, text: item.text };
  });
  assert.ok(result.isError === undefined || typeof result.isError === 'boolean');
  return { content, isError: result.isError };
}

function startApi(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server: Server = createServer(handler);
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise(close => server.close(() => close())),
      });
    });
  });
}

test('lists only read tools and calls public API through base-URL override', async () => {
  const requests: string[] = [];
  const api = await startApi((request, response) => {
    requests.push(request.url ?? '');
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ data: [{ id: 1, title: 'Iron Man' }], total: 1, page: 1, limit: 2 }));
  });
  const session = new McpSession(api.baseUrl);

  try {
    await session.initialize();
    const names = tools(await session.request('tools/list', {})).map(tool => tool.name);

    assert.deepEqual(names, [
      'get_health',
      'list_movies',
      'get_movie',
      'get_movie_characters',
      'get_movie_post_credit_scenes',
      'list_tvshows',
      'get_tvshow',
      'get_tvshow_characters',
      'get_tvshow_post_credit_scenes',
      'list_characters',
      'get_character',
      'get_character_movies',
      'get_character_tvshows',
      'list_people',
      'get_person',
      'get_person_characters',
      'get_person_titles',
      'list_post_credit_scenes',
      'get_post_credit_scene',
      'get_timeline',
      'list_upcoming',
      'list_titles',
      'search',
      'get_stats',
    ]);
    assert.equal(names.some(name => /create|update|delete|write/i.test(name)), false);

    const result = toolResult(
      await session.request('tools/call', {
        name: 'list_movies',
        arguments: { limit: 2, continuity: 'MCU' },
      }),
    );
    assert.equal(result.isError, undefined);
    assert.match(result.content[0]?.text ?? '', /Iron Man/);
    assert.equal(requests[0], '/api/v1/movies?limit=2&continuity=MCU');
  } finally {
    await session.close();
    await api.close();
  }
});

test('returns public API errors to MCP callers', async () => {
  const api = await startApi((_request, response) => {
    response.statusCode = 404;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ detail: 'Movie not found' }));
  });
  const session = new McpSession(api.baseUrl);

  try {
    await session.initialize();
    const result = toolResult(
      await session.request('tools/call', {
        name: 'get_movie',
        arguments: { id: 9999 },
      }),
    );

    assert.equal(result.isError, true);
    assert.match(result.content[0]?.text ?? '', /404/);
    assert.match(result.content[0]?.text ?? '', /Movie not found/);
  } finally {
    await session.close();
    await api.close();
  }
});
