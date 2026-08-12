import ICharacter from './ICharacter';
import { ColumnAllowList } from '@shared/infra/http/listParams';

export type CharacterColumn = keyof ICharacter;

const CHARACTER_COLUMNS: ColumnAllowList<CharacterColumn> = {
  id: 'exact',
  name: 'text',
  alias: 'text',
  description: 'text',
  image_url: 'text',
  played_by: 'text',
  continuity: 'text',
  multiverse_designation: 'text',
  variant_of: 'exact',
  first_appearance_movie_id: 'exact',
  first_appearance_tvshow_id: 'exact',
  created_at: 'exact',
  updated_at: 'exact',
};

export default CHARACTER_COLUMNS;
