import { uuid } from 'uuidv4';

import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '@modules/movies/dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '@modules/movies/dtos/IFindAllMoviesResponseDTO';
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

  public async findAll({
    page,
    limit,
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    const offset = page && limit && (page - 1) * limit;

    const filteredMovies = this.movies.slice(offset, limit);

    return { data: filteredMovies, total: this.movies.length };
  }
}

export default FakeMoviesRepository;
