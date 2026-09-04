const connect = jest.fn();
const on = jest.fn();
const sendCommand = jest.fn();
const quit = jest.fn();
const redisClient = { isOpen: false, connect, on, sendCommand, quit };
const redisStore = jest.fn();

jest.mock('redis', () => ({
  createClient: jest.fn(() => redisClient),
}));

jest.mock('rate-limit-redis', () => ({
  RedisStore: jest.fn(options => {
    options.sendCommand('SCRIPT', 'LOAD', 'script');
    return redisStore;
  }),
}));

describe('rateLimitStore', () => {
  const nodeEnv = process.env.NODE_ENV;
  const redisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    redisClient.isOpen = false;
    connect.mockImplementation(() => {
      redisClient.isOpen = true;
      return Promise.resolve();
    });
    sendCommand.mockResolvedValue('sha');
    quit.mockResolvedValue(undefined);
    process.env.NODE_ENV = 'production';
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterAll(() => {
    process.env.NODE_ENV = nodeEnv;
    process.env.REDIS_URL = redisUrl;
  });

  it('Should open Redis before the store loads its scripts', async () => {
    const { connectRateLimitStore, createRateLimitStore } =
      await import('./rateLimitStore');
    const { createClient } = await import('redis');

    createRateLimitStore();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(createClient as unknown as jest.Mock).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
      disableOfflineQueue: true,
    });
    expect(redisClient.isOpen).toBe(true);
    expect(sendCommand).toHaveBeenCalledWith(['SCRIPT', 'LOAD', 'script']);

    await expect(connectRateLimitStore()).resolves.toBeUndefined();
  });
});
