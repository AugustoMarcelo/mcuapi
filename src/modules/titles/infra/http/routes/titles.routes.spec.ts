import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('titles.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should list titles through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        data: [{ id: 1, type: 'movie', title: 'Iron Man' }],
        total: 1,
      }),
    });

    const response = await request(app).get('/api/v1/titles');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Iron Man');
  });
});
