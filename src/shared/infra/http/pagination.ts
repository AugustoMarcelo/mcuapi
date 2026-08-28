import AppError from '@shared/errors/AppError';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export function resolvePage(value: unknown): number {
  if (value === undefined) {
    return DEFAULT_PAGE;
  }

  return resolvePositiveInteger({ value, name: 'page' });
}

export function resolveLimit(value: unknown): number {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  const limit = resolvePositiveInteger({ value, name: 'limit' });

  if (limit > MAX_LIMIT) {
    throw new AppError(`limit must not exceed ${MAX_LIMIT}`);
  }

  return limit;
}

export function resolvePositiveInteger({
  value,
  name,
}: {
  value: unknown;
  name: string;
}): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new AppError(`${name} must be a positive integer`);
  }

  const integer = Number(value);

  if (!Number.isSafeInteger(integer)) {
    throw new AppError(`${name} must be a positive integer`);
  }

  return integer;
}
