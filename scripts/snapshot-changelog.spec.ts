import {
  buildChangelog,
  Changelog,
  diffResource,
  JsonRecord,
  SnapshotIndex,
  toRss,
} from './snapshot-changelog';

const previousIndex: SnapshotIndex = {
  content_hash: 'old-hash',
  generated_at: '2026-01-01T00:00:00.000Z',
};

const currentIndex: SnapshotIndex = {
  content_hash: 'new-hash',
  generated_at: '2026-01-08T00:00:00.000Z',
};

const emptyChangelog: Changelog = { version: 1, entries: [] };

function resources(records: JsonRecord[]): Record<string, JsonRecord[]> {
  return {
    movies: records,
    tvshows: [],
    characters: [],
    people: [],
    post_credit_scenes: [],
    timeline: [],
  };
}

describe('snapshot changelog', () => {
  it('classifies additions, removals, and field changes by record id', () => {
    const changes = diffResource({
      resource: 'movies',
      previous: [
        { id: 1, title: 'Iron Man', box_office: '585366247', _links: {} },
        { id: 2, title: 'The Incredible Hulk' },
      ],
      current: [
        {
          id: 1,
          title: 'Iron Man',
          box_office: '600000000',
          _links: { self: {} },
        },
        { id: 3, title: 'Iron Man 2' },
      ],
    });

    expect(changes.added.map(record => record.id)).toEqual(['3']);
    expect(changes.removed.map(record => record.id)).toEqual(['2']);
    expect(changes.changed).toEqual([
      {
        id: '1',
        label: 'Iron Man',
        fields: {
          box_office: { previous: '585366247', current: '600000000' },
        },
      },
    ]);
  });

  it('uses continuity and designation to identify timeline branches', () => {
    const changes = diffResource({
      resource: 'timeline',
      previous: [
        {
          continuity: 'Marvel Cinematic Universe',
          multiverse_designation: 'Earth-616',
          entries: [{ id: 1 }],
        },
      ],
      current: [
        {
          continuity: 'Marvel Cinematic Universe',
          multiverse_designation: 'Earth-616',
          entries: [{ id: 1 }, { id: 2 }],
        },
        {
          continuity: 'Sony Spider-Man Universe',
          multiverse_designation: 'Earth-688',
          entries: [],
        },
      ],
    });

    expect(changes.added.map(record => record.id)).toEqual([
      'Sony Spider-Man Universe:Earth-688',
    ]);
    expect(changes.changed[0]).toMatchObject({
      id: 'Marvel Cinematic Universe:Earth-616',
      fields: {
        entries: { previous: [{ id: 1 }], current: [{ id: 1 }, { id: 2 }] },
      },
    });
  });

  it('prepends a change event and renders it as RSS', () => {
    const changelog = buildChangelog({
      previousIndex,
      currentIndex,
      previousResources: resources([{ id: 1, title: 'A & B' }]),
      currentResources: resources([
        { id: 1, title: 'A & B', overview: 'New <detail>' },
      ]),
      existing: emptyChangelog,
    });

    expect(changelog.entries).toHaveLength(1);
    expect(changelog.entries[0].changes.movies?.changed[0].fields).toEqual({
      overview: { current: 'New <detail>' },
    });
    expect(toRss(changelog)).toContain('movies: 0 added, 0 removed, 1 changed');
    expect(toRss(changelog)).toContain('MCUAPI dataset update new-hash');
  });

  it('leaves the changelog unchanged when the content hash matches', () => {
    expect(
      buildChangelog({
        previousIndex,
        currentIndex: previousIndex,
        previousResources: resources([]),
        currentResources: resources([]),
        existing: emptyChangelog,
      }),
    ).toBe(emptyChangelog);
  });
});
