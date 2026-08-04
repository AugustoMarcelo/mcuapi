import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  resolveLimit,
  resolvePage,
} from './pagination';

describe('resolvePage', () => {
  it('Should default when the value is missing or not a number', () => {
    expect(resolvePage(undefined)).toBe(DEFAULT_PAGE);
    expect(resolvePage('')).toBe(DEFAULT_PAGE);
    expect(resolvePage('abc')).toBe(DEFAULT_PAGE);
  });

  it('Should default when the value is zero or negative', () => {
    expect(resolvePage('0')).toBe(DEFAULT_PAGE);
    expect(resolvePage('-5')).toBe(DEFAULT_PAGE);
  });

  it('Should accept a valid page and floor fractional values', () => {
    expect(resolvePage('3')).toBe(3);
    expect(resolvePage('2.9')).toBe(2);
  });
});

describe('resolveLimit', () => {
  it('Should default when the value is missing or not a number', () => {
    expect(resolveLimit(undefined)).toBe(DEFAULT_LIMIT);
    expect(resolveLimit('')).toBe(DEFAULT_LIMIT);
    expect(resolveLimit('abc')).toBe(DEFAULT_LIMIT);
  });

  it('Should default when the value is zero or negative', () => {
    expect(resolveLimit('0')).toBe(DEFAULT_LIMIT);
    expect(resolveLimit('-5')).toBe(DEFAULT_LIMIT);
  });

  it('Should accept a valid limit and floor fractional values', () => {
    expect(resolveLimit('25')).toBe(25);
    expect(resolveLimit('7.6')).toBe(7);
  });

  it('Should clamp values above the maximum', () => {
    expect(resolveLimit('100000')).toBe(MAX_LIMIT);
    expect(resolveLimit(String(MAX_LIMIT + 1))).toBe(MAX_LIMIT);
    expect(resolveLimit(String(MAX_LIMIT))).toBe(MAX_LIMIT);
  });
});
