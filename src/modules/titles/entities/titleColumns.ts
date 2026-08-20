import { ColumnAllowList } from '@shared/infra/http/listParams';

// The intersection of MOVIE_COLUMNS and TVSHOW_COLUMNS — only columns that
// exist, with the same match type, on both underlying tables can be safely
// filtered/ordered/selected across the UNION ALL.
export type TitleColumn =
  | 'id'
  | 'title'
  | 'release_date'
  | 'overview'
  | 'cover_url'
  | 'trailer_url'
  | 'directed_by'
  | 'phase'
  | 'saga'
  | 'chronology'
  | 'post_credit_scenes'
  | 'imdb_id'
  | 'studio'
  | 'continuity'
  | 'multiverse_designation'
  | 'is_mcu'
  | 'type'
  | 'timeline_chronology_order'
  | 'updated_at';

const TITLE_COLUMNS: ColumnAllowList<TitleColumn> = {
  id: 'exact',
  title: 'text',
  release_date: 'exact',
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

// The default projection when no `?columns=` is given — the lean fields
// shared with the promoted IUpcomingItemDTO shape.
export const DEFAULT_TITLE_COLUMNS: TitleColumn[] = [
  'id',
  'title',
  'release_date',
  'overview',
  'cover_url',
  'continuity',
  'multiverse_designation',
  'is_mcu',
  'phase',
  'saga',
];

export default TITLE_COLUMNS;
