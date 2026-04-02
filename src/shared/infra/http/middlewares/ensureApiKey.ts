import { Request, Response, NextFunction } from 'express';

export function ensureApiKey(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    response.status(401).json({ message: 'Invalid or missing API key' });
    return;
  }

  next();
}
