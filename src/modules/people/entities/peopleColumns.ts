import IPerson from './IPerson';
import { ColumnAllowList } from '@shared/infra/http/listParams';

export type PersonColumn = keyof IPerson;

const PEOPLE_COLUMNS: ColumnAllowList<PersonColumn> = {
  id: 'exact',
  name: 'text',
  created_at: 'exact',
  updated_at: 'exact',
};

export default PEOPLE_COLUMNS;
