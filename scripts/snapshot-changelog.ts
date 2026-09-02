export type JsonValue =
  string | number | boolean | null | JsonRecord | JsonValue[];

export interface JsonRecord {
  [key: string]: JsonValue;
}

export const snapshotResources = [
  { name: 'movies', file: 'movies.json' },
  { name: 'tvshows', file: 'tvshows.json' },
  { name: 'characters', file: 'characters.json' },
  { name: 'people', file: 'people.json' },
  { name: 'post_credit_scenes', file: 'post-credit-scenes.json' },
  { name: 'timeline', file: 'timeline.json' },
] as const;

type SnapshotResource = (typeof snapshotResources)[number]['name'];

export interface SnapshotIndex {
  content_hash: string;
  generated_at: string;
}

export interface FieldChange {
  previous?: JsonValue;
  current?: JsonValue;
}

export interface AddedRecord {
  id: string;
  label?: string;
  record: JsonRecord;
}

export interface ChangedRecord {
  id: string;
  label?: string;
  fields: Record<string, FieldChange>;
}

export interface ResourceChanges {
  added: AddedRecord[];
  removed: AddedRecord[];
  changed: ChangedRecord[];
}

export interface ChangelogEntry {
  generated_at: string;
  from: SnapshotIndex;
  to: SnapshotIndex;
  changes: Partial<Record<SnapshotResource, ResourceChanges>>;
}

export interface Changelog {
  version: 1;
  entries: ChangelogEntry[];
}

interface DiffInput {
  resource: SnapshotResource;
  previous: JsonRecord[];
  current: JsonRecord[];
}

interface ChangelogInput {
  previousIndex: SnapshotIndex;
  currentIndex: SnapshotIndex;
  previousResources: Record<SnapshotResource, JsonRecord[]>;
  currentResources: Record<SnapshotResource, JsonRecord[]>;
  existing: Changelog;
}

function canonical(value: JsonValue): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function recordId({
  resource,
  record,
}: {
  resource: SnapshotResource;
  record: JsonRecord;
}): string {
  if (resource === 'timeline') {
    const continuity = record.continuity;
    const designation = record.multiverse_designation;

    if (typeof continuity !== 'string' || typeof designation !== 'string') {
      throw new Error(
        'timeline records need continuity and multiverse_designation',
      );
    }

    return `${continuity}:${designation}`;
  }

  if (typeof record.id !== 'number' && typeof record.id !== 'string') {
    throw new Error(`${resource} records need an id`);
  }

  return String(record.id);
}

function recordLabel(record: JsonRecord): string | undefined {
  for (const key of ['title', 'name', 'continuity']) {
    if (typeof record[key] === 'string') return record[key];
  }

  return undefined;
}

function describeRecord({
  resource,
  record,
}: {
  resource: SnapshotResource;
  record: JsonRecord;
}): AddedRecord {
  const label = recordLabel(record);
  const id = recordId({ resource, record });

  return label ? { id, label, record } : { id, record };
}

function changedFields({
  previous,
  current,
}: {
  previous: JsonRecord;
  current: JsonRecord;
}): Record<string, FieldChange> {
  const fields: Record<string, FieldChange> = {};
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of [...keys].sort()) {
    if (
      key === '_links' ||
      canonical(previous[key]) === canonical(current[key])
    ) {
      continue;
    }

    const change: FieldChange = {};
    if (key in previous) change.previous = previous[key];
    if (key in current) change.current = current[key];
    fields[key] = change;
  }

  return fields;
}

export function diffResource({
  resource,
  previous,
  current,
}: DiffInput): ResourceChanges {
  const previousById = new Map(
    previous.map(record => [recordId({ resource, record }), record]),
  );
  const currentById = new Map(
    current.map(record => [recordId({ resource, record }), record]),
  );
  const added: AddedRecord[] = [];
  const removed: AddedRecord[] = [];
  const changed: ChangedRecord[] = [];

  for (const [id, record] of currentById) {
    const previousRecord = previousById.get(id);
    if (!previousRecord) {
      added.push(describeRecord({ resource, record }));
      continue;
    }

    const fields = changedFields({ previous: previousRecord, current: record });
    if (Object.keys(fields).length) {
      const label = recordLabel(record);
      changed.push(label ? { id, label, fields } : { id, fields });
    }
  }

  for (const [id, record] of previousById) {
    if (!currentById.has(id))
      removed.push(describeRecord({ resource, record }));
  }

  return { added, removed, changed };
}

function hasChanges(changes: ResourceChanges): boolean {
  return (
    changes.added.length > 0 ||
    changes.removed.length > 0 ||
    changes.changed.length > 0
  );
}

export function buildChangelog({
  previousIndex,
  currentIndex,
  previousResources,
  currentResources,
  existing,
}: ChangelogInput): Changelog {
  if (previousIndex.content_hash === currentIndex.content_hash) return existing;

  const changes: ChangelogEntry['changes'] = {};
  for (const { name } of snapshotResources) {
    const resourceChanges = diffResource({
      resource: name,
      previous: previousResources[name],
      current: currentResources[name],
    });

    if (hasChanges(resourceChanges)) changes[name] = resourceChanges;
  }

  const entry: ChangelogEntry = {
    generated_at: currentIndex.generated_at,
    from: previousIndex,
    to: currentIndex,
    changes,
  };

  if (existing.entries[0]?.to.content_hash === currentIndex.content_hash) {
    return existing;
  }

  return { version: 1, entries: [entry, ...existing.entries] };
}

function changeSummary(changes: ResourceChanges): string {
  return `${changes.added.length} added, ${changes.removed.length} removed, ${changes.changed.length} changed`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function toRss(changelog: Changelog): string {
  const link =
    'https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data/changelog.json';
  const items = changelog.entries
    .map(entry => {
      const summary = Object.entries(entry.changes)
        .map(([resource, changes]) => `${resource}: ${changeSummary(changes)}`)
        .join('; ');

      return [
        '    <item>',
        `      <title>${xmlEscape(`MCUAPI dataset update ${entry.to.content_hash}`)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="false">${entry.to.content_hash}</guid>`,
        `      <pubDate>${new Date(entry.generated_at).toUTCString()}</pubDate>`,
        `      <description>${xmlEscape(summary)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>MCUAPI dataset changelog</title>',
    `    <link>${link}</link>`,
    '    <description>Changes detected in the MCUAPI static dataset.</description>',
    '    <language>en</language>',
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
