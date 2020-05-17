import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateMovieService from '@modules/movies/services/CreateMovieService';

export default class MoviesController {
  public async create(request: Request, response: Response): Promise<Response> {
    const createMovie = container.resolve(CreateMovieService);

    const movie = await createMovie.execute(request.body);

    return response.json(movie);
  }
}
