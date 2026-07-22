import { Request } from 'express';
import getBaseUrl from './getBaseUrl';

function makeRequest(protocol: string, host: string): Request {
  return {
    protocol,
    get: (header: string) => (header === 'host' ? host : undefined),
  } as unknown as Request;
}

describe('getBaseUrl', () => {
  const originalAppUrl = process.env.APP_URL;

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.APP_URL;
    } else {
      process.env.APP_URL = originalAppUrl;
    }
  });

  it('Should build the base URL from the request when APP_URL is not set', () => {
    delete process.env.APP_URL;

    const baseUrl = getBaseUrl(makeRequest('http', 'localhost:3333'));

    expect(baseUrl).toBe('http://localhost:3333');
  });

  it('Should prefer APP_URL over the request host', () => {
    process.env.APP_URL = 'https://mcuapi.example.com';

    const baseUrl = getBaseUrl(makeRequest('http', 'localhost:3333'));

    expect(baseUrl).toBe('https://mcuapi.example.com');
  });

  it('Should strip trailing slashes from APP_URL', () => {
    process.env.APP_URL = 'https://mcuapi.example.com/';

    const baseUrl = getBaseUrl(makeRequest('http', 'localhost:3333'));

    expect(baseUrl).toBe('https://mcuapi.example.com');
  });
});
