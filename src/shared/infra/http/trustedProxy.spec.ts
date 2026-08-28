import { resolveTrustedProxy } from './trustedProxy';

describe('resolveTrustedProxy', () => {
  it('Should trust the direct Railway proxy in production', () => {
    expect(resolveTrustedProxy({ environment: 'production' })).toBe(1);
  });

  it('Should disable proxy trust outside production', () => {
    expect(resolveTrustedProxy({ environment: 'test' })).toBe(false);
  });
});
