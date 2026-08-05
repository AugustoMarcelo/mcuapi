import { MCUAPIError } from './errors';
import type {
  Character,
  Health,
  ListParams,
  Movie,
  Paginated,
  TVShow,
  TimelineGroup,
  TimelineParams,
  TitleListParams,
  WithRole,
} from './types';

export interface MCUAPIOptions {
  /** Defaults to the public deployment. */
  baseUrl?: string;
  /** Inject a custom fetch — useful for tests, proxies, or undici agents. */
  fetch?: typeof globalThis.fetch;
  /** Merged into every request. */
  headers?: Record<string, string>;
  /** Per-request timeout in ms. Omit to disable. */
  timeout?: number;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

const DEFAULT_BASE_URL = 'https://mcuapi.up.railway.app';

type QueryValue = string | number | boolean | undefined;

function toQuery(params: Record<string, QueryValue> = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    search.set(key, String(value));
  });

  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export class MCUAPI {
  readonly baseUrl: string;

  private readonly doFetch: typeof globalThis.fetch;

  private readonly headers: Record<string, string>;

  private readonly timeout?: number;

  constructor(options: MCUAPIOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.headers = { Accept: 'application/json', ...options.headers };
    this.timeout = options.timeout;

    const f = options.fetch ?? globalThis.fetch;
    if (typeof f !== 'function') {
      throw new TypeError(
        'No fetch implementation found. Use Node 18+, or pass one via `new MCUAPI({ fetch })`.',
      );
    }
    // Bind so a passed-in global fetch keeps its correct receiver.
    this.doFetch = f.bind(globalThis);
  }

  /**
   * Issues a GET and parses the JSON body.
   * `path` may be an absolute URL, which is what makes `follow()` work.
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;

    // Combine the caller's signal with our own timeout, without clobbering either.
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    options.signal?.addEventListener('abort', onAbort, { once: true });
    const timer =
      this.timeout === undefined
        ? undefined
        : setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await this.doFetch(url, {
        headers: this.headers,
        signal: controller.signal,
      });
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
    }

    const text = await response.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* leave body as the raw text */
    }

    if (!response.ok) throw new MCUAPIError(response.status, url, body);
    return body as T;
  }

  /** Follows a HAL `_links` href returned by the API. */
  follow<T>(link: { href: string } | string, options?: RequestOptions): Promise<T> {
    return this.request<T>(typeof link === 'string' ? link : link.href, options);
  }

  /**
   * Walks every page of a list endpoint by following `_links.next`, yielding
   * one record at a time. The API caps `limit` at 100, so this is how you read
   * a whole collection without hand-rolling the paging.
   */
  async *paginate<T>(
    path: string,
    params: Record<string, QueryValue> = {},
    options: RequestOptions = {},
  ): AsyncGenerator<T, void, undefined> {
    let next: string | undefined = `${path}${toQuery({ limit: 100, ...params })}`;

    while (next) {
      const page: Paginated<T> = await this.request<Paginated<T>>(next, options);
      for (const item of page.data) yield item;
      next = page._links?.next?.href;
    }
  }

  /** Service health. Returns `503` as an error when the database is unreachable. */
  health(options?: RequestOptions): Promise<Health> {
    return this.request<Health>('/health', options);
  }

  readonly movies = {
    list: (params: TitleListParams = {}, options?: RequestOptions) =>
      this.request<Paginated<Movie>>(
        `/api/v1/movies${toQuery(params as Record<string, QueryValue>)}`,
        options,
      ),

    get: (id: number | string, options?: RequestOptions) =>
      this.request<Movie>(`/api/v1/movies/${encodeURIComponent(id)}`, options),

    /** Async iterator over every movie matching `params`. */
    all: (params: TitleListParams = {}, options?: RequestOptions) =>
      this.paginate<Movie>(
        '/api/v1/movies',
        params as Record<string, QueryValue>,
        options,
      ),

    characters: (id: number | string, options?: RequestOptions) =>
      this.request<WithRole<Character>[]>(
        `/api/v1/characters/movie/${encodeURIComponent(id)}`,
        options,
      ),
  };

  readonly tvshows = {
    list: (params: TitleListParams = {}, options?: RequestOptions) =>
      this.request<Paginated<TVShow>>(
        `/api/v1/tvshows${toQuery(params as Record<string, QueryValue>)}`,
        options,
      ),

    get: (id: number | string, options?: RequestOptions) =>
      this.request<TVShow>(`/api/v1/tvshows/${encodeURIComponent(id)}`, options),

    all: (params: TitleListParams = {}, options?: RequestOptions) =>
      this.paginate<TVShow>(
        '/api/v1/tvshows',
        params as Record<string, QueryValue>,
        options,
      ),

    characters: (id: number | string, options?: RequestOptions) =>
      this.request<WithRole<Character>[]>(
        `/api/v1/characters/tvshow/${encodeURIComponent(id)}`,
        options,
      ),
  };

  readonly characters = {
    list: (params: ListParams = {}, options?: RequestOptions) =>
      this.request<Paginated<Character>>(
        `/api/v1/characters${toQuery(params as Record<string, QueryValue>)}`,
        options,
      ),

    get: (id: number | string, options?: RequestOptions) =>
      this.request<Character>(`/api/v1/characters/${encodeURIComponent(id)}`, options),

    all: (params: ListParams = {}, options?: RequestOptions) =>
      this.paginate<Character>(
        '/api/v1/characters',
        params as Record<string, QueryValue>,
        options,
      ),

    movies: (id: number | string, options?: RequestOptions) =>
      this.request<WithRole<Movie>[]>(
        `/api/v1/characters/${encodeURIComponent(id)}/movies`,
        options,
      ),

    tvshows: (id: number | string, options?: RequestOptions) =>
      this.request<WithRole<TVShow>[]>(
        `/api/v1/characters/${encodeURIComponent(id)}/tvshows`,
        options,
      ),
  };

  readonly timeline = {
    get: (params: TimelineParams = {}, options?: RequestOptions) =>
      this.request<TimelineGroup[]>(
        `/api/v1/timeline${toQuery(params as Record<string, QueryValue>)}`,
        options,
      ),
  };
}
