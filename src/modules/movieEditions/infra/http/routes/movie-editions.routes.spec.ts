import request from 'supertest';
import { container } from 'tsyringe';
import app from '@shared/infra/http/app';

describe('movie-editions.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => resolveSpy.mockRestore());

  it('lists editions with releases and teased movies', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            movie_id: 22,
            title: 'Avengers: Endgame: Encore',
            releases: [
              { id: 1, channel: 'theatrical', release_date: '2026-09-25' },
            ],
            teased_movies: [{ id: 39, title: 'Avengers: Doomsday' }],
          },
        ],
        total: 1,
      }),
    });

    const response = await request(app).get('/api/v1/movie-editions');

    expect(response.status).toBe(200);
    expect(response.body.data[0].teased_movies[0].title).toBe(
      'Avengers: Doomsday',
    );
    expect(response.body.data[0]._links.movie.href).toContain('/movies/22');
  });

  it('shows an edition by ID', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        id: 1,
        movie_id: 22,
        title: 'Encore',
        releases: [],
        teased_movies: [],
      }),
    });

    const response = await request(app).get('/api/v1/movie-editions/1');
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Encore');
  });

  it('rejects unsupported query parameters', async () => {
    const response = await request(app).get(
      '/api/v1/movie-editions?unexpected=value',
    );
    expect(response.status).toBe(400);
  });
});
