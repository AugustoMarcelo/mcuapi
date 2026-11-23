import IMovieEdition from '../entities/IMovieEdition';
import IFindMovieEditionsDTO from '../dtos/IFindMovieEditionsDTO';

export default interface IMovieEditionsRepository {
  findAll(
    data: IFindMovieEditionsDTO,
  ): Promise<{ data: IMovieEdition[]; total: number }>;
  findById(id: number): Promise<IMovieEdition | null>;
}
