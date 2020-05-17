import IMovie from '../entities/IMovie';
import ICreateMovie from '../dtos/ICreateMovieDTO';

export default interface IMoviesRepository {
  create(data: ICreateMovie): Promise<IMovie>;
}
