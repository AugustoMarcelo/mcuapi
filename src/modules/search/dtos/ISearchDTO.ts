import { SearchType } from '@modules/search/entities/searchTypes';

export default interface ISearchDTO {
  q: string;
  type?: SearchType;
  page?: number;
  limit?: number;
}
