import IMovie from '../entities/IMovie';
import ICreateMovieDTO from '../dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '../dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '../dtos/IFindAllMoviesResponseDTO';

export default interface IMoviesRepository {
  create(data: ICreateMovieDTO): Promise<IMovie>;
  update(movie: IMovie): Promise<IMovie>;
  findById(id: number): Promise<IMovie | undefined>;
  findAll(data: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO>;
}
