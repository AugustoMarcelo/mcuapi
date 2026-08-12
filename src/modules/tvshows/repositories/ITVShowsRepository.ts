import IFindAllTVShowsResponseDTO from '../dtos/IFindAllTVShowsResponseDTO';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';

export default interface ITVShowsRepository {
  findById(id: number): Promise<ITVShow | undefined>;
  findAll(data?: IFindAllTVShowsDTO): Promise<IFindAllTVShowsResponseDTO>;
  getStats(): Promise<IRepositoryStatsDTO>;
}
