import { FilterClause, OrderClause } from '@shared/infra/http/listParams';
import { TitleColumn } from '@modules/titles/entities/titleColumns';

export default interface IFindAllTitlesDTO {
  page?: number;
  limit?: number;
  columns?: TitleColumn[];
  order?: OrderClause<TitleColumn>[];
  filter?: FilterClause<TitleColumn>[];
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
  type?: 'movie' | 'tvshow';
  releaseDateAfter?: Date;
}
