import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('post-credit-scenes.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should list post-credit scenes through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            movie_id: 1,
            description: 'Nick Fury reveals the Avengers Initiative.',
            is_stinger: false,
          },
        ],
        total: 1,
      }),
    });

    const response = await request(app).get('/api/v1/post-credit-scenes');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('Should get a post-credit scene by ID through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        id: 1,
        movie_id: 1,
        description: 'Nick Fury reveals the Avengers Initiative.',
        is_stinger: false,
      }),
    });

    const response = await request(app).get('/api/v1/post-credit-scenes/1');

    expect(response.status).toBe(200);
    expect(response.body.description).toBe(
      'Nick Fury reveals the Avengers Initiative.',
    );
  });

  it('Should get post-credit scenes for a movie through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue([
        {
          id: 1,
          movie_id: 1,
          description: 'Nick Fury reveals the Avengers Initiative.',
          is_stinger: false,
        },
      ]),
    });

    const response = await request(app).get(
      '/api/v1/post-credit-scenes/movie/1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('Should get post-credit scenes for a tvshow through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue([
        {
          id: 2,
          tvshow_id: 1,
          description: 'A tease for the next season.',
          is_stinger: true,
        },
      ]),
    });

    const response = await request(app).get(
      '/api/v1/post-credit-scenes/tvshow/1',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
