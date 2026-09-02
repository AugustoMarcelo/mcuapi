import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  resolveLimit,
  resolvePage,
} from './pagination';
import AppError from '@shared/errors/AppError';

describe('resolvePage', () => {
  it('Should default only when the value is missing', () => {
    expect(resolvePage(undefined)).toBe(DEFAULT_PAGE);
  });

  it('Should reject malformed, fractional, zero, negative, and unsafe pages', () => {
    ['', 'abc', '2.9', '0', '-5', '9007199254740992'].forEach(value => {
      expect(() => resolvePage(value)).toThrow(AppError);
    });
  });

  it('Should accept a positive integer page', () => {
    expect(resolvePage('3')).toBe(3);
  });
});

describe('resolveLimit', () => {
  it('Should default only when the value is missing', () => {
    expect(resolveLimit(undefined)).toBe(DEFAULT_LIMIT);
  });

  it('Should reject malformed, fractional, zero, and negative limits', () => {
    ['', 'abc', '7.6', '0', '-5'].forEach(value => {
      expect(() => resolveLimit(value)).toThrow(AppError);
    });
  });

  it('Should accept a positive integer limit', () => {
    expect(resolveLimit('25')).toBe(25);
  });

  it('Should reject values above the maximum', () => {
    expect(() => resolveLimit('100000')).toThrow(AppError);
    expect(() => resolveLimit(String(MAX_LIMIT + 1))).toThrow(AppError);
    expect(resolveLimit(String(MAX_LIMIT))).toBe(MAX_LIMIT);
  });
});
