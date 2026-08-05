import { Request, Response } from 'express';
import { container } from 'tsyringe';

import GetStreamingByTitleService from '@modules/streaming/services/GetStreamingByTitleService';
import ListStreamingProvidersService from '@modules/streaming/services/ListStreamingProvidersService';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import presentStreamingCollection from '../presenters/StreamingPresenter';

export default class StreamingController {
  public async byMovie(
    request: Request,
    response: Response,
  ): Promise<Response> {
    return StreamingController.byTitle(request, response, 'movie');
  }

  public async byTVShow(
    request: Request,
    response: Response,
  ): Promise<Response> {
    return StreamingController.byTitle(request, response, 'tvshow');
  }

  public async providers(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { region } = request.query as { region?: string };

    const listProviders = container.resolve(ListStreamingProvidersService);
    const { regions, providers } = await listProviders.execute({ region });

    const baseUrl = getBaseUrl(request);

    return response.status(200).json({
      regions,
      providers,
      _links: { self: { href: `${baseUrl}/api/v1/streaming/providers` } },
    });
  }

  private static async byTitle(
    request: Request,
    response: Response,
    type: 'movie' | 'tvshow',
  ): Promise<Response> {
    const id =
      type === 'movie' ? request.params.movie_id : request.params.tvshow_id;
    const { region } = request.query as { region?: string };

    const getStreaming = container.resolve(GetStreamingByTitleService);
    const rows = await getStreaming.execute({
      title_id: Number(id),
      type,
      region,
    });

    return response.status(200).json(
      presentStreamingCollection({
        rows,
        baseUrl: getBaseUrl(request),
        type: type === 'movie' ? 'movies' : 'tvshows',
        title_id: Number(id),
        region: region ? region.toUpperCase() : undefined,
      }),
    );
  }
}
