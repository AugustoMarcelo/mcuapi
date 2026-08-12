import request from 'supertest';
import { container } from 'tsyringe';

import app from '@shared/infra/http/app';

describe('timeline.routes', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  it('Should return the timeline through the full HTTP stack', async () => {
    resolveSpy.mockReturnValue({
      execute: jest.fn().mockResolvedValue([
        {
          continuity: 'Sacred Timeline',
          multiverse_designation: 'Earth-616',
          entries: [
            { id: 1, title: 'Iron Man', chronology_order: 1, type: 'movie' },
          ],
        },
      ]),
    });

    const response = await request(app).get('/api/v1/timeline');

    expect(response.status).toBe(200);
    expect(response.body[0].entries[0]._links.self.href).toContain(
      '/api/v1/movies/1',
    );
  });
});
