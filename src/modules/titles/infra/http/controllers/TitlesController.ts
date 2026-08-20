import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListAllTitlesService from '@modules/titles/services/ListAllTitlesService';
import { presentTitleCollection } from '@modules/titles/infra/http/presenters/TitlePresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import { resolveLimit, resolvePage } from '@shared/infra/http/pagination';
import {
  resolveBoolean,
  resolveColumns,
  resolveFilter,
  resolveOrder,
} from '@shared/infra/http/listParams';
import TITLE_COLUMNS from '@modules/titles/entities/titleColumns';

interface IRequestQuery {
  columns?: string;
  order?: string;
  filter?: string;
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: string;
  type?: 'movie' | 'tvshow';
}

export default class TitlesController {
  public async index(request: Request, response: Response): Promise<Response> {
    const {
      columns,
      order,
      filter,
      studio,
      continuity,
      multiverse_designation,
      is_mcu,
      type,
    }: IRequestQuery = request.query;

    const page = resolvePage(request.query.page);
    const limit = resolveLimit(request.query.limit);

    const listAllTitles = container.resolve(ListAllTitlesService);
    const { data, total } = await listAllTitles.execute({
      page,
      limit,
      columns: resolveColumns(columns, TITLE_COLUMNS),
      order: resolveOrder(order, TITLE_COLUMNS),
      filter: resolveFilter(filter, TITLE_COLUMNS),
      studio,
      continuity,
      multiverse_designation,
      is_mcu: resolveBoolean(is_mcu),
      type,
    });

    return response.status(200).json(
      presentTitleCollection({
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
