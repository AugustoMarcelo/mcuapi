import { Request } from 'express';

export default function getBaseUrl(request: Request): string {
  const appUrl = process.env.APP_URL;

  if (appUrl) {
    return appUrl.replace(/\/+$/, '');
  }

  return `${request.protocol}://${request.get('host')}`;
}
