import { SearchType } from '@modules/search/entities/searchTypes';

export default interface ISearchRankHitDTO {
  type: SearchType;
  id: number;
}
