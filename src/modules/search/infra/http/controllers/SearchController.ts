import { Request, Response } from 'express';
import { container } from 'tsyringe';

import SearchService from '@modules/search/services/SearchService';
import { presentSearchCollection } from '@modules/search/infra/http/presenters/SearchPresenter';
import { isSearchType } from '@modules/search/entities/searchTypes';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import { resolveLimit, resolvePage } from '@shared/infra/http/pagination';
import AppError from '@shared/errors/AppError';

export default class SearchController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { q, type } = request.query as { q?: string; type?: string };

    if (!q || !q.trim()) {
      throw new AppError('q is required', 400);
    }

    const page = resolvePage(request.query.page);
    const limit = resolveLimit(request.query.limit);

    const search = container.resolve(SearchService);
    const { data, total } = await search.execute({
      q: q.trim(),
      type: isSearchType(type) ? type : undefined,
      page,
      limit,
    });

    return response.status(200).json(
      presentSearchCollection({
        data,
        total,
        page,
        limit,
        baseUrl: getBaseUrl(request),
        path: request.baseUrl + request.path,
        query: request.query,
      }),
    );
  }
}
