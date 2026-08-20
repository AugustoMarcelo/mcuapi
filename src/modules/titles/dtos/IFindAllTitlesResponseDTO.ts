import ITitleItemDTO from './ITitleItemDTO';

export default interface IFindAllTitlesResponseDTO {
  data: ITitleItemDTO[];
  total: number;
}
