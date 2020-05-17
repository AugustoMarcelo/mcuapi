import { Repository, getRepository } from 'typeorm';

import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import Movie from '../entities/Movie';

class MoviesRepository implements IMoviesRepository {
  private ormRepository: Repository<Movie>;

  constructor() {
    this.ormRepository = getRepository(Movie);
  }

  public async create(data: ICreateMovieDTO): Promise<Movie> {
    const movie = this.ormRepository.create(data);

    await this.ormRepository.save(movie);

    return movie;
  }

  public async update(movie: Movie): Promise<Movie> {
    return this.ormRepository.save(movie);
  }

  public async findById(id: string): Promise<Movie | undefined> {
    const findMovie = await this.ormRepository.findOne(id);

    return findMovie;
  }
}

export default MoviesRepository;
