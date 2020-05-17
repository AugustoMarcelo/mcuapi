import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateMovieService from '@modules/movies/services/CreateMovieService';
import UpdateMovieService from '@modules/movies/services/UpdateMovieService';

export default class MoviesController {
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
}
