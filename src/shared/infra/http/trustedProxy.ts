export function resolveTrustedProxyCidrs({
  value = process.env.TRUSTED_PROXY_CIDRS,
}: {
  value?: string;
} = {}): string[] | false {
  if (!value) {
    return false;
  }

  const cidrs = value.split(',').map(cidrsValue => cidrsValue.trim());

  if (cidrs.some(cidrsValue => !cidrsValue)) {
    throw new Error('TRUSTED_PROXY_CIDRS must not contain empty entries');
  }

  return cidrs;
}
