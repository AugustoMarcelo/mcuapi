import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';

import {
  buildChangelog,
  Changelog,
  JsonRecord,
  SnapshotIndex,
  snapshotResources,
  toRss,
} from './snapshot-changelog';

const OUT_DIR = path.resolve(__dirname, '..', 'data');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function readCurrent<T>(file: string): T {
  return readJson<T>(path.join(OUT_DIR, file));
}

function readPrevious<T>(file: string): T {
  const contents = childProcess.execFileSync(
    'git',
    ['show', `HEAD:data/${file}`],
    {
      encoding: 'utf8',
    },
  );
  return JSON.parse(contents) as T;
}

function readExisting(): Changelog {
  const file = path.join(OUT_DIR, 'changelog.json');
  if (!fs.existsSync(file)) return { version: 1, entries: [] };
  return readJson<Changelog>(file);
}

function main(): void {
  const previousIndex = readPrevious<SnapshotIndex>('index.json');
  const currentIndex = readCurrent<SnapshotIndex>('index.json');

  if (previousIndex.content_hash === currentIndex.content_hash) {
    process.stdout.write('Snapshot unchanged — changelog not updated.\n');
    return;
  }

  const previousResources = Object.fromEntries(
    snapshotResources.map(({ name, file }) => [
      name,
      readPrevious<JsonRecord[]>(file),
    ]),
  ) as Record<(typeof snapshotResources)[number]['name'], JsonRecord[]>;
  const currentResources = Object.fromEntries(
    snapshotResources.map(({ name, file }) => [
      name,
      readCurrent<JsonRecord[]>(file),
    ]),
  ) as Record<(typeof snapshotResources)[number]['name'], JsonRecord[]>;
  const changelog = buildChangelog({
    previousIndex,
    currentIndex,
    previousResources,
    currentResources,
    existing: readExisting(),
  });

  fs.writeFileSync(
    path.join(OUT_DIR, 'changelog.json'),
    `${JSON.stringify(changelog, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(OUT_DIR, 'changelog.xml'), toRss(changelog));
  process.stdout.write(`Changelog updated for ${currentIndex.content_hash}.\n`);
}

main();
