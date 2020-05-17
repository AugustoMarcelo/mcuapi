import { uuid } from 'uuidv4';

import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IMovie from '@modules/movies/entities/IMovie';

import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import IMoviesRepository from '../IMoviesRepository';

class FakeMoviesRepository implements IMoviesRepository {
  private movies: IMovie[] = [];

  public async create(data: ICreateMovieDTO): Promise<IMovie> {
    const movie = new Movie();

    Object.assign(movie, { id: uuid(), data });

    this.movies.push(movie);

    return movie;
  }
}

export default FakeMoviesRepository;
