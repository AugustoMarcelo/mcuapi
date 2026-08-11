import { FilterClause, OrderClause } from '@shared/infra/http/listParams';
import { CharacterColumn } from '@modules/characters/entities/characterColumns';

export default interface IFindAllCharactersDTO {
  page?: number;
  limit?: number;
  columns?: CharacterColumn[];
  order?: OrderClause<CharacterColumn>[];
  filter?: FilterClause<CharacterColumn>[];
  continuity?: string;
  multiverse_designation?: string;
}
