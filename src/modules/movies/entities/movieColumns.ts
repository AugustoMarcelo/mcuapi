import IMovie from './IMovie';
import { ColumnAllowList } from '@shared/infra/http/listParams';

export type MovieColumn = Exclude<
  keyof IMovie,
  'related_movies' | 'related_tvshows'
>;

const MOVIE_COLUMNS: ColumnAllowList<MovieColumn> = {
  id: 'exact',
  title: 'text',
  release_date: 'exact',
  box_office: 'exact',
  duration: 'exact',
  overview: 'text',
  cover_url: 'text',
  trailer_url: 'text',
  directed_by: 'text',
  phase: 'exact',
  saga: 'text',
  chronology: 'exact',
  post_credit_scenes: 'exact',
  imdb_id: 'text',
  studio: 'text',
  continuity: 'text',
  multiverse_designation: 'text',
  is_mcu: 'exact',
  type: 'text',
  timeline_chronology_order: 'exact',
  updated_at: 'exact',
};

export default MOVIE_COLUMNS;
