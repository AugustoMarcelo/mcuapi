import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import { presentMovie, presentMovieCollection } from './MoviePresenter';

const baseUrl = 'http://localhost:3333';

const movie = {
  id: 1,
  title: 'Iron Man',
  directed_by: 'Jon Favreau',
  post_credit_scenes: 1,
} as IMovie;

describe('MoviePresenter', () => {
  it('Should add self and characters links', () => {
    const presented = presentMovie(movie, baseUrl);

    expect(presented._links.self).toEqual({ href: `${baseUrl}/api/v1/movies/1` });
    expect(presented._links.characters).toEqual({ href: `${baseUrl}/api/v1/characters/movie/1` });
    expect(presented.title).toBe('Iron Man');
  });

  it('Should omit related_movies link when the relation is not loaded', () => {
    const presented = presentMovie(movie, baseUrl);

    expect(presented._links.related_movies).toBeUndefined();
  });

  it('Should link related_movies without embedding the full related movie data', () => {
    const related = { id: 2, title: 'Iron Man 2' } as IMovie;
    const presented = presentMovie({ ...movie, related_movies: [related] }, baseUrl);

    expect(presented._links.related_movies).toEqual([{ href: `${baseUrl}/api/v1/movies/2` }]);
    expect(presented.related_movies).toBeUndefined();
  });

  it('Should omit related_tvshows link when the relation is not loaded', () => {
    const presented = presentMovie(movie, baseUrl);

    expect(presented._links.related_tvshows).toBeUndefined();
  });

  it('Should link related_tvshows without embedding the full related tvshow data', () => {
    const related = { id: 3, title: 'Loki' } as ITVShow;
    const presented = presentMovie({ ...movie, related_tvshows: [related] }, baseUrl);

    expect(presented._links.related_tvshows).toEqual([{ href: `${baseUrl}/api/v1/tvshows/3` }]);
    expect(presented.related_tvshows).toBeUndefined();
  });

  it('Should skip id-dependent links when id is missing (columns selection)', () => {
    const presented = presentMovie({ title: 'Iron Man' } as IMovie, baseUrl);

    expect(presented._links).toEqual({});
  });

  it('Should wrap collections with pagination metadata and links', () => {
    const collection = presentMovieCollection({
      data: [movie],
      total: 12,
      page: '2',
      limit: '5',
      baseUrl,
      path: '/api/v1/movies',
      query: { page: '2', limit: '5' },
    });

    expect(collection.total).toBe(12);
    expect(collection.page).toBe(2);
    expect(collection.limit).toBe(5);
    expect(collection.data[0]._links.self).toEqual({ href: `${baseUrl}/api/v1/movies/1` });
    expect(collection._links.next).toEqual({ href: `${baseUrl}/api/v1/movies?limit=5&page=3` });
    expect(collection._links.prev).toEqual({ href: `${baseUrl}/api/v1/movies?limit=5&page=1` });
  });
});
