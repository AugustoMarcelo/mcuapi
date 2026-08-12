import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('people.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should list people through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        data: [{ id: 1, name: 'Chris Evans' }],
        total: 1,
      }),
    });

    const response = await request(app).get('/api/v1/people');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it('Should get a person by ID through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue({ id: 1, name: 'Chris Evans' }),
    });

    const response = await request(app).get('/api/v1/people/1');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Chris Evans');
  });

  it('Should get characters played by a person through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest
        .fn()
        .mockResolvedValue([{ id: 1, name: 'Steve Rogers', recast_order: 1 }]),
    });

    const response = await request(app).get('/api/v1/people/1/characters');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].recast_order).toBe(1);
  });

  it('Should get titles directed by a person through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest
        .fn()
        .mockResolvedValue([
          { id: 1, title: 'Iron Man', type: 'movie', role: 'director' },
        ]),
    });

    const response = await request(app).get('/api/v1/people/1/titles');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].role).toBe('director');
  });
});
