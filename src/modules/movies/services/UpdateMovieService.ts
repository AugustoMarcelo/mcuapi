import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IMovie from '../entities/IMovie';
import IMoviesRepository from '../repositories/IMoviesRepository';
import IUpdateMovieDTO from '../dtos/IUpdateMovieDTO';

@injectable()
class UpdateMovieService {
  constructor(
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
  ) {}

  public async execute({
    movie_id,
    title,
    release_date,
    box_office,
    chronology,
    cover_url,
    directed_by,
    duration,
    overview,
    phase,
    saga,
    post_credit_scenes,
  }: IUpdateMovieDTO): Promise<IMovie> {
    const movie = await this.moviesRepository.findById(movie_id);

    if (!movie) {
      throw new AppError('Movie not found');
    }

    movie.title = title || movie.title;
    movie.release_date = release_date || movie.release_date;
    movie.box_office = box_office || movie.box_office;
    movie.chronology = chronology || movie.chronology;
    movie.cover_url = cover_url || movie.cover_url;
    movie.directed_by = directed_by || movie.directed_by;
    movie.duration = duration || movie.duration;
    movie.overview = overview || movie.overview;
    movie.phase = phase || movie.phase;
    movie.saga = saga || movie.saga;
    movie.post_credit_scenes = post_credit_scenes || movie.post_credit_scenes;

    return this.moviesRepository.update(movie);
  }
}

export default UpdateMovieService;
