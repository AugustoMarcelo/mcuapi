import request from 'supertest';
import { container } from 'tsyringe';

import app from './app';
import AppError from '@shared/errors/AppError';

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
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.type).toBe('application/problem+json');
    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: 'Route not found',
      instance: '/api/v1/does-not-exist',
    });
  });

  it('Should translate an AppError into its status code and message via the error handler', async () => {
    mockService(
      jest.fn().mockRejectedValue(new AppError('Character not found', 404)),
    );
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const response = await request(app).get('/api/v1/characters/999');

    expect(response.status).toBe(404);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: 'Character not found',
      instance: '/api/v1/characters/999',
    });

    consoleErrorSpy.mockRestore();
  });

  it('Should return a generic 500 for an unexpected error', async () => {
    mockService(jest.fn().mockRejectedValue(new Error('boom')));
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();

    const response = await request(app).get('/api/v1/movies');

    expect(response.status).toBe(500);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Internal server error',
      instance: '/api/v1/movies',
    });

    stderrSpy.mockRestore();
  });

  it('Should translate malformed JSON into a 400 problem response', async () => {
    const response = await request(app)
      .post('/api/v1/movies')
      .set('Content-Type', 'application/json')
      .send('{');

    expect(response.status).toBe(400);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'Malformed JSON request body',
      instance: '/api/v1/movies',
    });
  });
});
