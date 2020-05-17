import IMovie from '../entities/IMovie';
import ICreateMovieDTO from '../dtos/ICreateMovieDTO';

export default interface IMoviesRepository {
  create(data: ICreateMovieDTO): Promise<IMovie>;
  update(movie: IMovie): Promise<IMovie>;
  findById(id: string): Promise<IMovie | undefined>;
}
