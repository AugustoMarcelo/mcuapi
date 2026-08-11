import { FilterClause, OrderClause } from '@shared/infra/http/listParams';
import { MovieColumn } from '@modules/movies/entities/movieColumns';

export default interface IFindAllMoviesDTO {
  page?: number;
  limit?: number;
  columns?: MovieColumn[];
  order?: OrderClause<MovieColumn>[];
  filter?: FilterClause<MovieColumn>[];
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
}
