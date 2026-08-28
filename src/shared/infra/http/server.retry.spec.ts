import { nextDatabaseAttempt } from './databaseRetry';
import { initializeDatabaseWithRetry } from './server';
import { initializeDataSource } from '@shared/infra/typeorm';

jest.mock('@shared/infra/typeorm', () => ({
  initializeDataSource: jest.fn(),
}));

describe('nextDatabaseAttempt', () => {
  it('Should restart bounded retry cycles instead of exiting', () => {
    expect(nextDatabaseAttempt({ attempt: 5 })).toBe(1);
  });

  it('Should advance attempts within a retry cycle', () => {
    expect(nextDatabaseAttempt({ attempt: 2 })).toBe(3);
  });
});

describe('initializeDatabaseWithRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (initializeDataSource as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Should keep retrying after five failures and recover on a later attempt', async () => {
    let attempts = 0;
    (initializeDataSource as jest.Mock).mockImplementation(async () => {
      attempts += 1;
      if (attempts <= 5) {
        throw new Error('database unavailable');
      }
    });

    await initializeDatabaseWithRetry({ attempt: 1 });

    const advanceRetries = async (remaining: number): Promise<void> => {
      if (!remaining) {
        return;
      }

      await jest.advanceTimersByTimeAsync(5_000);
      await advanceRetries(remaining - 1);
    };

    await advanceRetries(5);

    expect(attempts).toBe(6);
  });
});
