import buildPaginationLinks from './buildPaginationLinks';

const baseUrl = 'http://localhost:3333';
const path = '/api/v1/movies';

describe('buildPaginationLinks', () => {
  it('Should return only self and first links when limit is absent', () => {
    const { _links, meta } = buildPaginationLinks({
      baseUrl,
      path,
      query: {},
      total: 40,
    });

    expect(_links.self).toEqual({
      href: 'http://localhost:3333/api/v1/movies',
    });
    expect(_links.first).toEqual(_links.self);
    expect(_links.next).toBeUndefined();
    expect(_links.prev).toBeUndefined();
    expect(_links.last).toBeUndefined();
    expect(meta).toEqual({ page: 1 });
  });

  it('Should build first, last and next links on the first page', () => {
    const { _links, meta } = buildPaginationLinks({
      baseUrl,
      path,
      query: { limit: '5' },
      limit: '5',
      total: 12,
    });

    expect(_links.self).toEqual({ href: `${baseUrl}${path}?limit=5&page=1` });
    expect(_links.first).toEqual({ href: `${baseUrl}${path}?limit=5&page=1` });
    expect(_links.last).toEqual({ href: `${baseUrl}${path}?limit=5&page=3` });
    expect(_links.next).toEqual({ href: `${baseUrl}${path}?limit=5&page=2` });
    expect(_links.prev).toBeUndefined();
    expect(meta).toEqual({ page: 1, limit: 5 });
  });

  it('Should build prev and next links on a middle page', () => {
    const { _links } = buildPaginationLinks({
      baseUrl,
      path,
      query: { page: '2', limit: '5' },
      page: '2',
      limit: '5',
      total: 12,
    });

    expect(_links.prev).toEqual({ href: `${baseUrl}${path}?limit=5&page=1` });
    expect(_links.next).toEqual({ href: `${baseUrl}${path}?limit=5&page=3` });
  });

  it('Should omit next on the last page', () => {
    const { _links } = buildPaginationLinks({
      baseUrl,
      path,
      query: { page: '3', limit: '5' },
      page: '3',
      limit: '5',
      total: 12,
    });

    expect(_links.next).toBeUndefined();
    expect(_links.prev).toEqual({ href: `${baseUrl}${path}?limit=5&page=2` });
  });

  it('Should preserve other query params in every link', () => {
    const { _links } = buildPaginationLinks({
      baseUrl,
      path,
      query: {
        page: '2',
        limit: '5',
        order: 'release_date,DESC',
        studio: 'Marvel Studios',
      },
      page: '2',
      limit: '5',
      total: 20,
    });

    const next = (_links.next as { href: string }).href;

    expect(next).toContain('order=release_date%2CDESC');
    expect(next).toContain('studio=Marvel+Studios');
    expect(next).toContain('page=3');
  });

  it('Should use resolved pagination values instead of raw query values', () => {
    const { _links } = buildPaginationLinks({
      baseUrl,
      path,
      query: { page: '2.9', limit: '100000', studio: 'Marvel Studios' },
      page: 2,
      limit: 100,
      total: 300,
    });

    expect(_links.self).toEqual({
      href: `${baseUrl}${path}?studio=Marvel+Studios&limit=100&page=2`,
    });
    expect(_links.next).toEqual({
      href: `${baseUrl}${path}?studio=Marvel+Studios&limit=100&page=3`,
    });
  });

  it('Should strip the trailing slash from the router-root path', () => {
    const { _links } = buildPaginationLinks({
      baseUrl,
      path: '/api/v1/movies/',
      query: {},
      total: 3,
    });

    expect(_links.self).toEqual({ href: `${baseUrl}/api/v1/movies` });
  });

  it('Should point last to page 1 when there are no rows', () => {
    const { _links } = buildPaginationLinks({
      baseUrl,
      path,
      query: { limit: '5' },
      limit: '5',
      total: 0,
    });

    expect(_links.last).toEqual({ href: `${baseUrl}${path}?limit=5&page=1` });
    expect(_links.next).toBeUndefined();
  });
});
