import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateMovieService from '@modules/movies/services/CreateMovieService';
import UpdateMovieService from '@modules/movies/services/UpdateMovieService';
import ListAllMoviesService from '@modules/movies/services/ListAllMoviesService';
import ShowMovieService from '@modules/movies/services/ShowMovieService';

interface IRequestQuery {
  page?: number;
  limit?: number;
}

export default class MoviesController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { page, limit }: IRequestQuery = request.query;

    const listAllMovies = container.resolve(ListAllMoviesService);
    const { data, total } = await listAllMovies.execute({
      page,
      limit,
    });

    return response.json({ data, total });
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

    const movie = await showMovie.execute({ movie_id });

    return response.json(movie);
  }
}
