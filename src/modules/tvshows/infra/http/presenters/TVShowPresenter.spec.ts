import { presentTVShow, presentTVShowCollection } from './TVShowPresenter';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';

const baseUrl = 'http://localhost:3333';

const tvshow = {
  id: 3,
  title: 'Loki',
  season: 1,
  number_episodes: 6,
} as ITVShow;

describe('TVShowPresenter', () => {
  it('Should add self and characters links', () => {
    const presented = presentTVShow(tvshow, baseUrl);

    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/3`,
    });
    expect(presented._links.characters).toEqual({
      href: `${baseUrl}/api/v1/characters/tvshow/3`,
    });
    expect(presented.title).toBe('Loki');
  });

  it('Should skip links when id is missing (columns selection)', () => {
    const presented = presentTVShow({ title: 'Loki' } as ITVShow, baseUrl);

    expect(presented._links).toEqual({});
  });

  it('Should omit related_movies link when the relation is not loaded', () => {
    const presented = presentTVShow(tvshow, baseUrl);

    expect(presented._links.related_movies).toBeUndefined();
  });

  it('Should link related_movies without embedding the full related movie data', () => {
    const related = { id: 1, title: 'Avengers: Endgame' } as IMovie;
    const presented = presentTVShow(
      { ...tvshow, related_movies: [related] },
      baseUrl,
    );

    expect(presented._links.related_movies).toEqual([
      { href: `${baseUrl}/api/v1/movies/1` },
    ]);
    expect(presented.related_movies).toBeUndefined();
  });

  it('Should omit related_tvshows link when the relation is not loaded', () => {
    const presented = presentTVShow(tvshow, baseUrl);

    expect(presented._links.related_tvshows).toBeUndefined();
  });

  it('Should link related_tvshows without embedding the full related tvshow data', () => {
    const related = { id: 2, title: 'Hawkeye' } as ITVShow;
    const presented = presentTVShow(
      { ...tvshow, related_tvshows: [related] },
      baseUrl,
    );

    expect(presented._links.related_tvshows).toEqual([
      { href: `${baseUrl}/api/v1/tvshows/2` },
    ]);
    expect(presented.related_tvshows).toBeUndefined();
  });

  it('Should wrap collections with pagination metadata and links', () => {
    const collection = presentTVShowCollection({
      data: [tvshow],
      total: 1,
      baseUrl,
      path: '/api/v1/tvshows',
      query: {},
    });

    expect(collection.total).toBe(1);
    expect(collection.page).toBe(1);
    expect(collection._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows`,
    });
    expect(collection.data[0]._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/3`,
    });
  });
});
