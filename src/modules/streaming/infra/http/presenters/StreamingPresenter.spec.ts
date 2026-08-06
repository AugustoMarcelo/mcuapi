import IStreamingAvailability from '@modules/streaming/entities/IStreamingAvailability';
import { presentStreamingCollection } from './StreamingPresenter';

const row = (
  overrides: Partial<IStreamingAvailability> = {},
): IStreamingAvailability => ({
  id: 1,
  movie_id: 1,
  tvshow_id: null,
  region: 'US',
  provider: 'Disney+',
  url: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const baseUrl = 'https://api.test';

describe('presentStreamingCollection', () => {
  it('Should group offers by region', () => {
    const result = presentStreamingCollection({
      rows: [
        row({ region: 'US', provider: 'Disney+' }),
        row({ id: 2, region: 'US', provider: 'Apple TV' }),
        row({ id: 3, region: 'BR', provider: 'Disney+' }),
      ],
      baseUrl,
      type: 'movies',
      title_id: 1,
    });

    expect(result.data).toHaveLength(2);
    expect(result.data.map(entry => entry.region)).toEqual(['BR', 'US']);
    expect(result.data[1].offers).toHaveLength(2);
  });

  it('Should report the row count, not the region count', () => {
    const result = presentStreamingCollection({
      rows: [row(), row({ id: 2, provider: 'Apple TV' })],
      baseUrl,
      type: 'movies',
      title_id: 1,
    });

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(1);
  });

  it('Should return an empty payload rather than null when nothing is known', () => {
    const result = presentStreamingCollection({
      rows: [],
      baseUrl,
      type: 'movies',
      title_id: 7,
    });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result._links.self.href).toBe(
      'https://api.test/api/v1/movies/7/streaming',
    );
  });

  it('Should link back to the title and the provider index', () => {
    const result = presentStreamingCollection({
      rows: [row()],
      baseUrl,
      type: 'tvshows',
      title_id: 8,
    });

    expect(result._links.title.href).toBe('https://api.test/api/v1/tvshows/8');
    expect(result._links.providers.href).toBe(
      'https://api.test/api/v1/streaming/providers',
    );
  });

  it('Should preserve a region filter in the self link', () => {
    const result = presentStreamingCollection({
      rows: [row({ region: 'BR' })],
      baseUrl,
      type: 'movies',
      title_id: 1,
      region: 'BR',
    });

    expect(result._links.self.href).toBe(
      'https://api.test/api/v1/movies/1/streaming?region=BR',
    );
  });

  it('Should expose the provider url when one is recorded', () => {
    const result = presentStreamingCollection({
      rows: [row({ url: 'https://www.disneyplus.com/movies/iron-man/x' })],
      baseUrl,
      type: 'movies',
      title_id: 1,
    });

    expect(result.data[0].offers[0].url).toBe(
      'https://www.disneyplus.com/movies/iron-man/x',
    );
  });

  it('Should not expose internal row ids or foreign keys', () => {
    const result = presentStreamingCollection({
      rows: [row()],
      baseUrl,
      type: 'movies',
      title_id: 1,
    });

    const serialised = JSON.stringify(result.data);
    expect(serialised).not.toContain('movie_id');
    expect(serialised).not.toContain('tvshow_id');
    expect(serialised).not.toContain('created_at');
  });
});
