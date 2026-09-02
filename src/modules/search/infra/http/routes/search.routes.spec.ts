import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('search.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should search across types through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        data: [
          {
            type: 'movie',
            id: 1,
            title: 'Iron Man',
            directed_by: 'Jon Favreau',
            post_credit_scenes: 1,
          },
        ],
        total: 1,
      }),
    });

    const response = await request(app)
      .get('/api/v1/search')
      .query({ q: 'Iron Man' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].type).toBe('movie');
    expect(response.body.data[0]._links.self).toEqual({
      href: expect.stringContaining('/api/v1/movies/1'),
    });
  });

  it('Should reject a missing q with a 400', async () => {
    const response = await request(app).get('/api/v1/search');

    expect(response.status).toBe(400);
    expect(response.body.detail).toBe('q is required');
  });

  it('Should ignore an unrecognized type instead of erroring', async () => {
    const executeSpy = jest.fn().mockResolvedValue({ data: [], total: 0 });
    resolveSpy.mockReturnValue({ execute: executeSpy });

    const response = await request(app)
      .get('/api/v1/search')
      .query({ q: 'Iron Man', type: 'not-a-real-type' });

    expect(response.status).toBe(200);
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: undefined }),
    );
  });
});
