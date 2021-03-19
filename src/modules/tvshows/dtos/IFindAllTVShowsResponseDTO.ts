import ITVShow from '@modules/tvshows/entities/ITVShow';

export default interface IFindAllTVShowsResponseDTO {
  data: ITVShow[];
  total: number;
}
