import ISearchRankHitDTO from './ISearchRankHitDTO';

export default interface IRankSearchResponseDTO {
  hits: ISearchRankHitDTO[];
  total: number;
}
