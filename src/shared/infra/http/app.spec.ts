import request from 'supertest';
import { container } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import app from './app';

describe('app', () => {
  let resolveSpy: jest.SpyInstance;

  beforeEach(() => {
    resolveSpy = jest.spyOn(container, 'resolve');
  });

  afterEach(() => {
    resolveSpy.mockRestore();
  });

  function mockService(execute: jest.Mock) {
    resolveSpy.mockReturnValue({ execute });
  }

  it('Should return 404 for an unmatched route', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
  });

  it('Should translate an AppError into its status code and message via the error handler', async () => {
    mockService(
      jest.fn().mockRejectedValue(new AppError('Character not found', 404)),
    );
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const response = await request(app).get('/api/v1/characters/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'Error',
      statusCode: 404,
      message: 'Character not found',
    });

    consoleErrorSpy.mockRestore();
  });

  it('Should return a generic 500 for an unexpected error', async () => {
    mockService(jest.fn().mockRejectedValue(new Error('boom')));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const response = await request(app).get('/api/v1/movies');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'Error',
      statusCode: 500,
      message: 'Internal server error',
    });

    consoleErrorSpy.mockRestore();
  });
});
