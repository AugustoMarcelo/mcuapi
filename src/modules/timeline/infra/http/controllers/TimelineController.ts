import { Request, Response } from 'express';
import { container } from 'tsyringe';

import GetTimelineService from '@modules/timeline/services/GetTimelineService';
import { presentTimeline } from '@modules/timeline/infra/http/presenters/TimelinePresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';

interface IRequestQuery {
  multiverse?: string;
}

export default class TimelineController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { multiverse }: IRequestQuery = request.query;

    const getTimeline = container.resolve(GetTimelineService);
    const timeline = await getTimeline.execute(multiverse);

    return response
      .status(200)
      .json(presentTimeline(timeline, getBaseUrl(request)));
  }
}
