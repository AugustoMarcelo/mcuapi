const connect = jest.fn();
const on = jest.fn();
const sendCommand = jest.fn();
const quit = jest.fn();
const redisClient = { isOpen: false, connect, on, sendCommand, quit };
const redisStore = jest.fn();
let loadScript: (() => Promise<unknown>) | undefined;

jest.mock('redis', () => ({
  createClient: jest.fn(() => redisClient),
}));

jest.mock('rate-limit-redis', () => ({
  RedisStore: jest.fn(options => {
    loadScript = () => options.sendCommand('SCRIPT', 'LOAD', 'script');
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
    loadScript = undefined;
    connect.mockImplementation(() => Promise.resolve());
    sendCommand.mockResolvedValue('sha');
    quit.mockResolvedValue(undefined);
    process.env.NODE_ENV = 'production';
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterAll(() => {
    process.env.NODE_ENV = nodeEnv;
    process.env.REDIS_URL = redisUrl;
  });

  it('Should wait for Redis before the rate-limit store sends a command', async () => {
    let resolveConnection: (() => void) | undefined;
    connect.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveConnection = () => {
            redisClient.isOpen = true;
            resolve();
          };
        }),
    );

    const { createRateLimitStore } = await import('./rateLimitStore');
    const { createClient } = await import('redis');

    createRateLimitStore();
    const command = loadScript?.();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(createClient as unknown as jest.Mock).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
      disableOfflineQueue: true,
    });
    expect(sendCommand).not.toHaveBeenCalled();

    resolveConnection?.();

    await expect(command).resolves.toBe('sha');
    expect(sendCommand).toHaveBeenCalledWith(['SCRIPT', 'LOAD', 'script']);
  });
});
