import { Request, Response } from 'express';
import { container } from 'tsyringe';

import GetStatsService from '@modules/stats/services/GetStatsService';
import { presentStats } from '@modules/stats/infra/http/presenters/StatsPresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';

export default class StatsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const getStats = container.resolve(GetStatsService);
    const stats = await getStats.execute();

    return response.status(200).json(presentStats(stats, getBaseUrl(request)));
  }
}
