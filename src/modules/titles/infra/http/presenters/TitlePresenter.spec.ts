import { presentTitleCollection } from './TitlePresenter';

const baseUrl = 'http://localhost:3333';

describe('TitlePresenter', () => {
  it('Should link each item at its underlying movie or tvshow resource', () => {
    const data = [
      {
        id: 8,
        type: 'tvshow' as const,
        title: 'Loki',
      },
      {
        id: 1,
        type: 'movie' as const,
        title: 'Iron Man',
      },
    ];

    const presented = presentTitleCollection({
      data,
      total: 2,
      page: 1,
      limit: 10,
      baseUrl,
      path: '/api/v1/titles',
      query: {},
    });

    expect(presented.data[0]._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/8`,
    });
    expect(presented.data[1]._links.self).toEqual({
      href: `${baseUrl}/api/v1/movies/1`,
    });
    expect(presented.total).toBe(2);
    expect(presented.page).toBe(1);
    expect(presented.limit).toBe(10);
  });

  it('Should carry standard pagination links', () => {
    const data = [{ id: 1, type: 'movie' as const, title: 'Iron Man' }];

    const presented = presentTitleCollection({
      data,
      total: 1,
      page: 1,
      limit: 10,
      baseUrl,
      path: '/api/v1/titles',
      query: {},
    });

    expect(presented._links.self).toBeDefined();
    expect(presented._links.first).toBeDefined();
    expect(presented._links.last).toBeDefined();
  });
});
