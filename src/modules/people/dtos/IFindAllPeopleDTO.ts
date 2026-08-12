import { FilterClause, OrderClause } from '@shared/infra/http/listParams';
import { PersonColumn } from '@modules/people/entities/peopleColumns';

export default interface IFindAllPeopleDTO {
  page?: number;
  limit?: number;
  columns?: PersonColumn[];
  order?: OrderClause<PersonColumn>[];
  filter?: FilterClause<PersonColumn>[];
}
