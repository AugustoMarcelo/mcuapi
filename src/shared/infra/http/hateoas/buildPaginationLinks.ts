import { IResourceLinks } from './types';

interface IBuildPaginationLinksParams {
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
  page?: number | string;
  limit?: number | string;
  total: number;
}

interface IBuildPaginationLinksResult {
  _links: IResourceLinks;
  meta: { page: number; limit?: number };
}

function buildUrl(
  baseUrl: string,
  path: string,
  query: Record<string, unknown>,
  page?: number,
  limit?: number,
): string {
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path;
  const params = new URLSearchParams();

  Object.keys(query)
    .sort()
    .forEach(key => {
      if (key === 'page' || key === 'limit') return;
      const value = query[key];
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  if (page !== undefined) {
    params.set('page', String(page));
  }

  const queryString = params.toString();

  return `${baseUrl}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
}

export default function buildPaginationLinks({
  baseUrl,
  path,
  query,
  page,
  limit,
  total,
}: IBuildPaginationLinksParams): IBuildPaginationLinksResult {
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || undefined;

  if (!perPage) {
    const self = buildUrl(baseUrl, path, query);

    return {
      _links: { self: { href: self }, first: { href: self } },
      meta: { page: 1 },
    };
  }

  const lastPage = Math.max(1, Math.ceil(total / perPage));

  const _links: IResourceLinks = {
    self: { href: buildUrl(baseUrl, path, query, currentPage, perPage) },
    first: { href: buildUrl(baseUrl, path, query, 1, perPage) },
    last: { href: buildUrl(baseUrl, path, query, lastPage, perPage) },
  };

  if (currentPage > 1) {
    _links.prev = {
      href: buildUrl(baseUrl, path, query, currentPage - 1, perPage),
    };
  }

  if (currentPage * perPage < total) {
    _links.next = {
      href: buildUrl(baseUrl, path, query, currentPage + 1, perPage),
    };
  }

  return { _links, meta: { page: currentPage, limit: perPage } };
}
