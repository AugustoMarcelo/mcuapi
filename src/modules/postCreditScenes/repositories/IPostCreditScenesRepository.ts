import IPostCreditScene from '../entities/IPostCreditScene';
import IFindAllPostCreditScenesDTO from '../dtos/IFindAllPostCreditScenesDTO';
import IFindAllPostCreditScenesResponseDTO from '../dtos/IFindAllPostCreditScenesResponseDTO';

export default interface IPostCreditScenesRepository {
  findById(id: number): Promise<IPostCreditScene | undefined>;
  findAll(
    data: IFindAllPostCreditScenesDTO,
  ): Promise<IFindAllPostCreditScenesResponseDTO>;
  findByMovieId(movie_id: number): Promise<IPostCreditScene[]>;
  findByTVShowId(tvshow_id: number): Promise<IPostCreditScene[]>;
}
