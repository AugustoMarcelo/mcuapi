import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IMoviesRepository from '../repositories/IMoviesRepository';
import IMovie from '../entities/IMovie';

interface IRequest {
  movie_id: number;
}

@injectable()
class ListAllMoviesService {
  constructor(
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
  ) {}

  public async execute({ movie_id }: IRequest): Promise<IMovie> {
    const movie = await this.moviesRepository.findById(movie_id);

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    return movie;
  }
}

export default ListAllMoviesService;
