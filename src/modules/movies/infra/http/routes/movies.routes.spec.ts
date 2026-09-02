import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('movies.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should list movies through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest
        .fn()
        .mockResolvedValue({ data: [{ id: 1, title: 'Iron Man' }], total: 1 }),
    });

    const response = await request(app).get('/api/v1/movies');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Iron Man');
    expect(response.headers['cache-control']).toBe('public, max-age=3600');
  });

  it('Should reject malformed list parameters before resolving a service', async () => {
    const response = await request(app).get('/api/v1/movies?page=1.5');

    expect(response.status).toBe(400);
    expect(resolveSpy).not.toHaveBeenCalled();
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.detail).toBe('page must be a positive integer');
  });

  it('Should reject unknown list parameters before resolving a service', async () => {
    const response = await request(app).get('/api/v1/movies?unknown=value');

    expect(response.status).toBe(400);
    expect(resolveSpy).not.toHaveBeenCalled();
    expect(response.body.detail).toBe('Unsupported query parameter: unknown');
  });

  it('Should reject invalid IDs before resolving a service', async () => {
    const response = await request(app).get('/api/v1/movies/not-an-id');

    expect(response.status).toBe(400);
    expect(resolveSpy).not.toHaveBeenCalled();
    expect(response.body.detail).toBe('movie_id must be a positive integer');
    expect(JSON.stringify(response.body)).not.toContain('NaN');
  });

  it('Should reject query parameters on movie detail requests', async () => {
    const response = await request(app).get('/api/v1/movies/1?page=bad');

    expect(response.status).toBe(400);
    expect(resolveSpy).not.toHaveBeenCalled();
    expect(response.body.detail).toBe('Unsupported query parameter: page');
  });
});
