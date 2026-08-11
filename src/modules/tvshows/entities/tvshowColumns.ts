import { ColumnAllowList } from '@shared/infra/http/listParams';
import ITVShow from './ITVShow';

export type TVShowColumn = Exclude<
  keyof ITVShow,
  'related_movies' | 'related_tvshows'
>;

const TVSHOW_COLUMNS: ColumnAllowList<TVShowColumn> = {
  id: 'exact',
  title: 'text',
  overview: 'text',
  cover_url: 'text',
  trailer_url: 'text',
  season: 'exact',
  number_episodes: 'exact',
  release_date: 'exact',
  last_aired_date: 'exact',
  directed_by: 'text',
  phase: 'exact',
  saga: 'text',
  chronology: 'exact',
  imdb_id: 'text',
  updated_at: 'exact',
  studio: 'text',
  continuity: 'text',
  multiverse_designation: 'text',
  is_mcu: 'exact',
  type: 'text',
  timeline_chronology_order: 'exact',
};

export default TVSHOW_COLUMNS;
