import { Request, Response } from 'express';

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

export function sendProblem({
  request,
  response,
  status,
  detail,
}: {
  request: Request;
  response: Response;
  status: number;
  detail: string;
}): Response {
  response.set('Cache-Control', 'no-store');

  return response
    .status(status)
    .type('application/problem+json')
    .json({
      type: 'about:blank',
      title: TITLES[status] ?? 'Error',
      status,
      detail,
      instance: request.originalUrl,
    });
}
