import { injectable, inject } from 'tsyringe';
import IMovie from '../entities/IMovie';
import IMoviesRepository from '../repositories/IMoviesRepository';
import ICreateMovieDTO from '../dtos/ICreateMovieDTO';

@injectable()
class CreateMovieService {
  constructor(
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
  ) {}

  public async execute(data: ICreateMovieDTO): Promise<IMovie> {
    const movie = await this.moviesRepository.create(data);

    return movie;
  }
}

export default CreateMovieService;
