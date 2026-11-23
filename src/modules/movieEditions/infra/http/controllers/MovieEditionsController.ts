import { Request, Response } from 'express';
import { container } from 'tsyringe';
import {
  presentMovieEdition,
  presentMovieEditionCollection,
} from '../presenters/MovieEditionPresenter';
import ListMovieEditionsService from '@modules/movieEditions/services/ListMovieEditionsService';
import ShowMovieEditionService from '@modules/movieEditions/services/ShowMovieEditionService';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import {
  resolveLimit,
  resolvePage,
  resolvePositiveInteger,
} from '@shared/infra/http/pagination';

export default class MovieEditionsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const movie_id =
      request.query.movie_id === undefined
        ? undefined
        : resolvePositiveInteger({
            value: request.query.movie_id,
            name: 'movie_id',
          });
    const page = resolvePage(request.query.page);
    const limit = resolveLimit(request.query.limit);
    const service = container.resolve(ListMovieEditionsService);
    const { data, total } = await service.execute({ page, limit, movie_id });
    return response.status(200).json(
      presentMovieEditionCollection({
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
    const id = resolvePositiveInteger({
      value: request.params.movie_edition_id,
      name: 'movie_edition_id',
    });
    const service = container.resolve(ShowMovieEditionService);
    const edition = await service.execute(id);
    return response
      .status(200)
      .json(presentMovieEdition(edition, getBaseUrl(request)));
  }
}
