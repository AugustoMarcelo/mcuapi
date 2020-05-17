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

  public async update(movie: IMovie): Promise<IMovie> {
    const findIndex = this.movies.findIndex(
      findMovie => findMovie.id === movie.id,
    );

    this.movies[findIndex] = movie;

    return movie;
  }

  public async findById(id: string): Promise<IMovie | undefined> {
    const findMovie = this.movies.find(movie => movie.id === id);

    return findMovie;
  }
}

export default FakeMoviesRepository;
