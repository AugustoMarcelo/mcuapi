import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('upcoming.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should list upcoming titles through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
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
    });

    const response = await request(app).get('/api/v1/upcoming');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
