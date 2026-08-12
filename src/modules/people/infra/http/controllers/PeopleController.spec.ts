import { Request, Response } from 'express';
import { container } from 'tsyringe';

import PeopleController from './PeopleController';

jest.mock('tsyringe', () => ({
  ...jest.requireActual<typeof import('tsyringe')>('tsyringe'),
  container: { resolve: jest.fn() },
}));

function makeRequest(query: Record<string, string> = {}): Request {
  return {
    query,
    baseUrl: '',
    path: '/people',
    protocol: 'http',
    get: (header: string) => (header === 'host' ? 'localhost:3333' : undefined),
  } as unknown as Request;
}

function makeResponse(): Response {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
}

describe('PeopleController', () => {
  it('Should default to page 1 and limit 10 when none are provided', async () => {
    const execute = jest.fn().mockResolvedValue({ data: [], total: 0 });
    (container.resolve as jest.Mock).mockReturnValue({ execute });

    const controller = new PeopleController();
    await controller.index(makeRequest(), makeResponse());

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('Should respect explicit page and limit query params', async () => {
    const execute = jest.fn().mockResolvedValue({ data: [], total: 0 });
    (container.resolve as jest.Mock).mockReturnValue({ execute });

    const controller = new PeopleController();
    await controller.index(
      makeRequest({ page: '2', limit: '5' }),
      makeResponse(),
    );

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5 }),
    );
  });
});
