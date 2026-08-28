const DATABASE_CONNECTION_ATTEMPTS = 5;

export function nextDatabaseAttempt({ attempt }: { attempt: number }): number {
  return attempt === DATABASE_CONNECTION_ATTEMPTS ? 1 : attempt + 1;
}
