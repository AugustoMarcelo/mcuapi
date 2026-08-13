import { presentStats } from './StatsPresenter';

const baseUrl = 'http://localhost:3333';

describe('StatsPresenter', () => {
  it('Should attach a self link pointing at /api/v1/stats', () => {
    const stats = {
      movies: 74,
      tvshows: 56,
      characters: 302,
      people: 372,
      titles: 130,
      continuities: 10,
      designations: 5,
      last_updated: new Date('2026-08-09T18:22:04.000Z'),
    };

    const presented = presentStats(stats, baseUrl);

    expect(presented.movies).toBe(74);
    expect(presented.designations).toBe(5);
    expect(presented._links).toEqual({
      self: { href: `${baseUrl}/api/v1/stats` },
    });
  });

  it('Should carry a null last_updated through unchanged', () => {
    const stats = {
      movies: 0,
      tvshows: 0,
      characters: 0,
      people: 0,
      titles: 0,
      continuities: 0,
      designations: 0,
      last_updated: null,
    };

    const presented = presentStats(stats, baseUrl);

    expect(presented.last_updated).toBeNull();
  });
});
