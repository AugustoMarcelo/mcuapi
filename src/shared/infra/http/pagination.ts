export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export function resolvePage(value: unknown): number {
  const page = Number(value) || DEFAULT_PAGE;

  return page < 1 ? DEFAULT_PAGE : Math.floor(page);
}

export function resolveLimit(value: unknown): number {
  const limit = Number(value) || DEFAULT_LIMIT;

  if (limit < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.floor(Math.min(limit, MAX_LIMIT));
}
