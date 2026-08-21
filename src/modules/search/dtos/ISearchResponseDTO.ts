import ISearchHitDTO from './ISearchHitDTO';

export default interface ISearchResponseDTO {
  data: ISearchHitDTO[];
  total: number;
}
