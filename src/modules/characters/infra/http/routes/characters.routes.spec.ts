import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('characters.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should list characters through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest
        .fn()
        .mockResolvedValue({ data: [{ id: 1, name: 'Tony Stark' }], total: 1 }),
    });

    const response = await request(app).get('/api/v1/characters');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
