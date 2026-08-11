import { FilterClause, OrderClause } from '@shared/infra/http/listParams';
import { TVShowColumn } from '@modules/tvshows/entities/tvshowColumns';

export default interface IFindAllTVShowsDTO {
  page?: number;
  limit?: number;
  columns?: TVShowColumn[];
  order?: OrderClause<TVShowColumn>[];
  filter?: FilterClause<TVShowColumn>[];
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
}
