import {
  presentMovieEdition,
  presentMovieEditionCollection,
} from './MovieEditionPresenter';

const edition = {
  id: 1,
  movie_id: 22,
  title: 'Avengers: Endgame: Encore',
  description: 'Updated cut.',
  releases: [
    { id: 1, channel: 'theatrical', release_date: new Date('2026-09-25') },
  ],
  teased_movies: [{ id: 39, title: 'Avengers: Doomsday' }],
};

describe('MovieEditionPresenter', () => {
  it('adds movie edition and relation links', () => {
    const presented = presentMovieEdition(edition, 'https://api.example.com');

    expect(presented._links).toEqual({
      self: { href: 'https://api.example.com/api/v1/movie-editions/1' },
      movie: { href: 'https://api.example.com/api/v1/movies/22' },
      teased_movies: [{ href: 'https://api.example.com/api/v1/movies/39' }],
    });
  });

  it('adds pagination links to collections', () => {
    const presented = presentMovieEditionCollection({
      data: [edition],
      total: 1,
      page: 1,
      limit: 10,
      baseUrl: 'https://api.example.com',
      path: '/api/v1/movie-editions',
      query: {},
    });

    expect(presented.data).toHaveLength(1);
    expect(presented._links.first).toEqual({
      href: 'https://api.example.com/api/v1/movie-editions?limit=10&page=1',
    });
  });
});
