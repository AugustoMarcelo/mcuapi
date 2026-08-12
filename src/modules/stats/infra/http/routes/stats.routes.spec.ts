import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('stats.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should return stats through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        movies: 40,
        tvshows: 20,
        characters: 300,
        titles: 60,
        continuities: 5,
        designations: 10,
        last_updated: null,
      }),
    });

    const response = await request(app).get('/api/v1/stats');

    expect(response.status).toBe(200);
    expect(response.body.movies).toBe(40);
  });
});
