import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateMovieService from '@modules/movies/services/CreateMovieService';
import UpdateMovieService from '@modules/movies/services/UpdateMovieService';
import ListAllMoviesService from '@modules/movies/services/ListAllMoviesService';
import ShowMovieService from '@modules/movies/services/ShowMovieService';
import {
  presentMovie,
  presentMovieCollection,
} from '@modules/movies/infra/http/presenters/MoviePresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import { resolveLimit, resolvePage } from '@shared/infra/http/pagination';
import {
  resolveBoolean,
  resolveColumns,
  resolveFilter,
  resolveOrder,
} from '@shared/infra/http/listParams';
import MOVIE_COLUMNS from '@modules/movies/entities/movieColumns';

interface IRequestQuery {
  columns?: string;
  order?: string;
  filter?: string;
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: string;
}

export default class MoviesController {
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

    const page = resolvePage(request.query.page);
    const limit = resolveLimit(request.query.limit);

    const listAllMovies = container.resolve(ListAllMoviesService);
    const { data, total } = await listAllMovies.execute({
      page,
      limit,
      columns: resolveColumns(columns, MOVIE_COLUMNS),
      order: resolveOrder(order, MOVIE_COLUMNS),
      filter: resolveFilter(filter, MOVIE_COLUMNS),
      studio,
      continuity,
      multiverse_designation,
      is_mcu: resolveBoolean(is_mcu),
    });

    return response.status(200).json(
      presentMovieCollection({
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

  public async create(request: Request, response: Response): Promise<Response> {
    const createMovie = container.resolve(CreateMovieService);

    const movie = await createMovie.execute(request.body);

    return response.json(movie);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateMovie = container.resolve(UpdateMovieService);

    const { movie_id } = request.params;

    const updatedMovie = await updateMovie.execute({
      movie_id,
      ...request.body,
    });

    return response.json(updatedMovie);
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { movie_id } = request.params;

    const showMovie = container.resolve(ShowMovieService);

    const movie = await showMovie.execute({ movie_id: Number(movie_id) });

    if (!movie) {
      return response.status(404).json({ message: 'Movie not found' });
    }

    return response.status(200).json(presentMovie(movie, getBaseUrl(request)));
  }
}
