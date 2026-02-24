import { container } from 'tsyringe';
import { Request, Response } from 'express';
import ListTVShowsService from '@modules/tvshows/services/ListTVShowsService';
import ShowTVShowService from '@modules/tvshows/services/ShowTVShowService';

interface IRequestQuery {
  page?: number;
  limit?: number;
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
      page,
      limit,
      columns,
      order,
      filter,
      studio,
      continuity,
      multiverse_designation,
      is_mcu,
    }: IRequestQuery = request.query;

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

    return response.status(200).json({ data, total });
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { tvshow_id } = request.params;
    const showTVShow = container.resolve(ShowTVShowService);
    const tvshow = await showTVShow.execute({ tvshow_id: Number(tvshow_id) });

    if (!tvshow) {
      return response.status(404).json({ message: 'TV Show not found' });
    }

    return response.status(200).json(tvshow);
  }
}
