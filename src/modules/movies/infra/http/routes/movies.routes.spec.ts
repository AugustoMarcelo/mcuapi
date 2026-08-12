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
});
