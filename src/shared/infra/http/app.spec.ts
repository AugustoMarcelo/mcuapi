import request from 'supertest';
import { container } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import app from './app';

describe('app', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  function mockService(execute: jest.Mock) {
    resolveSpy.mockReturnValue({ execute });
  }

  it('Should list movies through the full HTTP stack', async () => {
    mockService(
      jest
        .fn()
        .mockResolvedValue({ data: [{ id: 1, title: 'Iron Man' }], total: 1 }),
    );

    const response = await request(app).get('/api/v1/movies');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Iron Man');
    expect(response.headers['cache-control']).toBe('public, max-age=3600');
  });

  it('Should list tvshows through the full HTTP stack', async () => {
    mockService(
      jest
        .fn()
        .mockResolvedValue({ data: [{ id: 1, title: 'Loki' }], total: 1 }),
    );

    const response = await request(app).get('/api/v1/tvshows');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('Should list characters through the full HTTP stack', async () => {
    mockService(
      jest
        .fn()
        .mockResolvedValue({ data: [{ id: 1, name: 'Tony Stark' }], total: 1 }),
    );

    const response = await request(app).get('/api/v1/characters');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('Should return the timeline through the full HTTP stack', async () => {
    mockService(
      jest.fn().mockResolvedValue([
        {
          continuity: 'Sacred Timeline',
          multiverse_designation: 'Earth-616',
          entries: [
            { id: 1, title: 'Iron Man', chronology_order: 1, type: 'movie' },
          ],
        },
      ]),
    );

    const response = await request(app).get('/api/v1/timeline');

    expect(response.status).toBe(200);
    expect(response.body[0].entries[0]._links.self.href).toContain(
      '/api/v1/movies/1',
    );
  });

  it('Should list upcoming titles through the full HTTP stack', async () => {
    mockService(
      jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            title: 'Avengers: Doomsday',
            type: 'movie',
            release_date: '2027-05-01',
          },
        ],
        total: 1,
      }),
    );

    const response = await request(app).get('/api/v1/upcoming');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('Should return stats through the full HTTP stack', async () => {
    mockService(
      jest.fn().mockResolvedValue({
        movies: 40,
        tvshows: 20,
        characters: 300,
        titles: 60,
        continuities: 5,
        designations: 10,
        last_updated: null,
      }),
    );

    const response = await request(app).get('/api/v1/stats');

    expect(response.status).toBe(200);
    expect(response.body.movies).toBe(40);
  });

  it('Should return 404 for an unmatched route', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
  });

  it('Should translate an AppError into its status code and message via the error handler', async () => {
    mockService(
      jest.fn().mockRejectedValue(new AppError('Character not found', 404)),
    );
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const response = await request(app).get('/api/v1/characters/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'Error',
      statusCode: 404,
      message: 'Character not found',
    });

    consoleErrorSpy.mockRestore();
  });

  it('Should return a generic 500 for an unexpected error', async () => {
    mockService(jest.fn().mockRejectedValue(new Error('boom')));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const response = await request(app).get('/api/v1/movies');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'Error',
      statusCode: 500,
      message: 'Internal server error',
    });

    consoleErrorSpy.mockRestore();
  });
});
