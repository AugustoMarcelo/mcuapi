export function resolveTrustedProxy({
  environment = process.env.NODE_ENV,
}: {
  environment?: string;
} = {}): 1 | false {
  return environment === 'production' ? 1 : false;
}
