import { Repository, getRepository } from 'typeorm';

import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '@modules/movies/dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '@modules/movies/dtos/IFindAllMoviesResponseDTO';
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

  public async findAll({
    page,
    limit,
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    const skip = page && limit && (page - 1) * limit;

    const [movies, total] = await this.ormRepository.findAndCount({
      take: limit,
      skip,
    });

    return { data: movies, total };
  }
}

export default MoviesRepository;
