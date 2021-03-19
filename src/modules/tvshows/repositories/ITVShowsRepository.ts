import ITVShow from '@modules/tvshows/entities/ITVShow';
import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '../dtos/IFindAllTVShowsResponseDTO';

export default interface ITVShowsRepository {
  findById(id: number): Promise<ITVShow | undefined>;
  findAll(data?: IFindAllTVShowsDTO): Promise<IFindAllTVShowsResponseDTO>;
}
