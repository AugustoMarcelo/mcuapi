import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const request = [
  JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'test', version: '1.0' },
    },
  }),
  JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }),
  JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
].join('\n');

const output = execFileSync('node', ['dist/index.js'], {
  cwd: new URL('.', import.meta.url),
  input: `${request}\n`,
  encoding: 'utf8',
});
const listing = JSON.parse(output.trim().split('\n').at(-1));
assert.ok(listing.result.tools.some(tool => tool.name === 'delete_movie'));
