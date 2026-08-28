/** Thrown when the API returns a non-2xx response. */
export class MCUAPIError extends Error {
  readonly status: number;

  readonly url: string;

  /** Parsed JSON body when the error response had one, otherwise the raw text. */
  readonly body: unknown;

  constructor(status: number, url: string, body: unknown) {
    super(`${status} from ${url}${MCUAPIError.detail(body)}`);
    this.name = 'MCUAPIError';
    this.status = status;
    this.url = url;
    this.body = body;
  }

  /** `true` when the 100 req/min rate limit was exceeded. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  private static detail(body: unknown): string {
    if (!body || typeof body !== 'object') {
      return '';
    }

    if ('detail' in body) {
      const { detail } = body as { detail?: unknown };
      if (typeof detail === 'string' && detail) return `: ${detail}`;
    }

    if ('message' in body) {
      const { message } = body as { message?: unknown };
      if (typeof message === 'string' && message) return `: ${message}`;
    }

    return '';
  }
}
