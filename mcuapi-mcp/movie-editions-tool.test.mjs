import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const cwd = new URL('.', import.meta.url);

function callTool(name, args) {
  const input = [
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
    JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  ].join('\n');
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['dist/index.js'], { cwd, env: process.env });
    let output = '';
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`No response for ${name}`));
    }, 5000);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      output += chunk;
      for (const line of output.split('\n')) {
        let response;
        try {
          response = JSON.parse(line);
        } catch {
          continue;
        }
        if (response.id === 2) {
          clearTimeout(timeout);
          child.kill();
          resolve(response.result);
        }
      }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => {
      output += chunk;
    });
    child.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('exit', code => {
      if (code !== null && code !== 0) {
        clearTimeout(timeout);
        reject(new Error(output));
      }
    });
    child.stdin.end(`${input}\n`);
  });
}

const created = await callTool('create_movie_edition', {
  movie_id: 22,
  title: `Smoke edition ${Date.now()}`,
});
const invalidMovie = await callTool('create_movie_edition', {
  movie_id: 999999,
  title: 'Invalid edition reference',
});
assert.equal(invalidMovie.isError, true);
const match = created.content[0].text.match(/\[(\d+)\]/);
assert.ok(match, created.content[0].text);
const id = Number(match[1]);

try {
  await callTool('update_movie_edition', {
    id,
    releases: [
      { channel: 'theatrical', release_date: '2026-09-25' },
      { channel: 'streaming', release_date: '2026-11-13' },
    ],
  });
  await callTool('link_movie_edition_tease', { edition_id: id, movie_id: 39 });
  const invalidTease = await callTool('link_movie_edition_tease', { edition_id: id, movie_id: 999999 });
  assert.equal(invalidTease.isError, true);
  const duplicate = await callTool('link_movie_edition_tease', { edition_id: id, movie_id: 39 });
  assert.match(duplicate.content[0].text, /already exists/);

  const listed = await callTool('list_movie_editions', { movie_id: 22 });
  const editions = JSON.parse(listed.content[0].text);
  const edition = editions.find(item => item.id === id);
  assert.equal(edition.releases.length, 2);
  assert.equal(edition.teased_movies.length, 1);
  const fetched = await callTool('get_movie_edition', { id });
  assert.equal(JSON.parse(fetched.content[0].text).title, edition.title);

  await callTool('unlink_movie_edition_tease', { edition_id: id, movie_id: 39 });
} finally {
  await callTool('delete_movie_edition', { id, confirm: true });
}
