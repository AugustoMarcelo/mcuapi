import { presentUpcomingCollection } from './UpcomingPresenter';

const baseUrl = 'http://localhost:3333';

describe('UpcomingPresenter', () => {
  it('Should link each item at its underlying movie or tvshow resource', () => {
    const data = [
      {
        id: 53,
        type: 'tvshow' as const,
        title: 'VisionQuest',
        release_date: new Date('2026-10-14'),
      },
      {
        id: 2,
        type: 'movie' as const,
        title: 'Avengers: Doomsday',
        release_date: new Date('2026-12-18'),
      },
    ];

    const presented = presentUpcomingCollection({
      data,
      total: 2,
      page: 1,
      limit: 10,
      baseUrl,
      path: '/api/v1/upcoming',
      query: {},
    });

    expect(presented.data[0]._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/53`,
    });
    expect(presented.data[1]._links.self).toEqual({
      href: `${baseUrl}/api/v1/movies/2`,
    });
    expect(presented.total).toBe(2);
    expect(presented.page).toBe(1);
    expect(presented.limit).toBe(10);
  });

  it('Should carry standard pagination links', () => {
    const data = [
      {
        id: 1,
        type: 'movie' as const,
        title: 'A',
        release_date: new Date('2026-09-01'),
      },
    ];

    const presented = presentUpcomingCollection({
      data,
      total: 1,
      page: 1,
      limit: 10,
      baseUrl,
      path: '/api/v1/upcoming',
      query: {},
    });

    expect(presented._links.self).toBeDefined();
    expect(presented._links.first).toBeDefined();
    expect(presented._links.last).toBeDefined();
  });
});
