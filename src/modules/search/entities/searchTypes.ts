export type SearchType = 'movie' | 'tvshow' | 'character' | 'person';

export const SEARCH_TYPES: readonly SearchType[] = [
  'movie',
  'tvshow',
  'character',
  'person',
];

export function isSearchType(value: unknown): value is SearchType {
  return (
    typeof value === 'string' &&
    (SEARCH_TYPES as readonly string[]).includes(value)
  );
}
