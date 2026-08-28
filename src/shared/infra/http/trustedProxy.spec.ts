import { resolveTrustedProxyCidrs } from './trustedProxy';

describe('resolveTrustedProxyCidrs', () => {
  it('Should disable proxy trust when no CIDRs are configured', () => {
    expect(resolveTrustedProxyCidrs({ value: undefined })).toBe(false);
  });

  it('Should split and trim every configured CIDR', () => {
    expect(
      resolveTrustedProxyCidrs({ value: '10.0.0.0/8, 192.0.2.0/24' }),
    ).toEqual(['10.0.0.0/8', '192.0.2.0/24']);
  });

  it('Should reject empty CIDR entries', () => {
    expect(() => resolveTrustedProxyCidrs({ value: '10.0.0.0/8, ' })).toThrow(
      'TRUSTED_PROXY_CIDRS must not contain empty entries',
    );
  });
});
