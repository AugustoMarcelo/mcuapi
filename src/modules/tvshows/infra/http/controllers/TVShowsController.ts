import { container } from 'tsyringe';
import { Request, Response } from 'express';
import ListTVShowsService from '@modules/tvshows/services/ListTVShowsService';
import ShowTVShowService from '@modules/tvshows/services/ShowTVShowService';
import {
  presentTVShow,
  presentTVShowCollection,
} from '@modules/tvshows/infra/http/presenters/TVShowPresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@shared/infra/http/pagination';

interface IRequestQuery {
  columns?: string;
  order?: string;
  filter?: string;
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: string;
}

export default class TVShowsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const {
      columns,
      order,
      filter,
      studio,
      continuity,
      multiverse_designation,
      is_mcu,
    }: IRequestQuery = request.query;

    const page = Number(request.query.page) || DEFAULT_PAGE;
    const limit = Number(request.query.limit) || DEFAULT_LIMIT;

    const listAllTVShows = container.resolve(ListTVShowsService);
    const { data, total } = await listAllTVShows.execute({
      page,
      limit,
      columns,
      order,
      filter,
      studio,
      continuity,
      multiverse_designation,
      is_mcu: is_mcu === 'true' ? true : is_mcu === 'false' ? false : undefined,
    });

    return response.status(200).json(
      presentTVShowCollection({
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

  public async show(request: Request, response: Response): Promise<Response> {
    const { tvshow_id } = request.params;
    const showTVShow = container.resolve(ShowTVShowService);
    const tvshow = await showTVShow.execute({ tvshow_id: Number(tvshow_id) });

    if (!tvshow) {
      return response.status(404).json({ message: 'TV Show not found' });
    }

    return response.status(200).json(presentTVShow(tvshow, getBaseUrl(request)));
  }
}
