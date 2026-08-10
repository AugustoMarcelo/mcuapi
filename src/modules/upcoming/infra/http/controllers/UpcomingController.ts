import { Request, Response } from 'express';
import { container } from 'tsyringe';

import GetUpcomingService from '@modules/upcoming/services/GetUpcomingService';
import { presentUpcomingCollection } from '@modules/upcoming/infra/http/presenters/UpcomingPresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import { resolveLimit, resolvePage } from '@shared/infra/http/pagination';

interface IRequestQuery {
  type?: 'movie' | 'tvshow';
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: string;
}

function parseBooleanQuery(value: string | undefined): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;

  return undefined;
}

export default class UpcomingController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { type, continuity, multiverse_designation, is_mcu }: IRequestQuery =
      request.query;

    const page = resolvePage(request.query.page);
    const limit = resolveLimit(request.query.limit);

    const getUpcoming = container.resolve(GetUpcomingService);
    const { data, total } = await getUpcoming.execute({
      page,
      limit,
      type,
      continuity,
      multiverse_designation,
      is_mcu: parseBooleanQuery(is_mcu),
    });

    return response.status(200).json(
      presentUpcomingCollection({
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
