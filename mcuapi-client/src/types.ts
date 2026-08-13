/**
 * Types mirror what the API actually returns, verified against production —
 * not what the server-side entities declare. The two have drifted before.
 */

export interface Link {
  href: string;
}

export interface ResourceLinks {
  self?: Link;
  characters?: Link;
  movies?: Link;
  tvshows?: Link;
  titles?: Link;
  related_movies?: Link[];
  related_tvshows?: Link[];
  variant_of?: Link;
  first_appearance_movie?: Link;
  first_appearance_tvshow?: Link;
}

export interface Movie {
  id: number;
  title: string;
  /**
   * Postgres returns `bigint` as a string to avoid precision loss, so this is
   * `"585171547"`, not `585171547`. Use `BigInt()` or `Number()` deliberately.
   */
  box_office: string | null;
  release_date: string | null;
  duration: number | null;
  overview: string | null;
  cover_url: string | null;
  trailer_url: string | null;
  directed_by: string | null;
  phase: number | null;
  saga: string | null;
  chronology: number | null;
  post_credit_scenes: number;
  imdb_id: string | null;
  studio: string | null;
  continuity: string | null;
  multiverse_designation: string | null;
  is_mcu: boolean;
  type: string;
  timeline_chronology_order: number | null;
  updated_at: string;
  _links?: ResourceLinks;
}

export interface TVShow {
  id: number;
  title: string;
  release_date: string | null;
  last_aired_date: string | null;
  season: number;
  number_episodes: number;
  overview: string | null;
  cover_url: string | null;
  trailer_url: string | null;
  directed_by: string | null;
  phase: number | null;
  saga: string | null;
  chronology: number | null;
  imdb_id: string | null;
  studio: string | null;
  continuity: string | null;
  multiverse_designation: string | null;
  is_mcu: boolean;
  type: string;
  timeline_chronology_order: number | null;
  updated_at: string;
  _links?: ResourceLinks;
}

export interface Character {
  id: number;
  name: string;
  alias: string | null;
  description: string | null;
  image_url: string | null;
  /** Comma-separated, chronological, for recast roles: `"Edward Norton, Mark Ruffalo"`. */
  played_by: string | null;
  continuity: string | null;
  multiverse_designation: string | null;
  variant_of: number | null;
  first_appearance_movie_id: number | null;
  first_appearance_tvshow_id: number | null;
  created_at: string;
  updated_at: string;
  _links?: ResourceLinks;
}

/** Appearance endpoints append the join row's `role_type` to each record. */
export type WithRole<T> = T & { role_type: string | null };

export interface Person {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  _links?: ResourceLinks;
}

/** `/people/{id}/characters` appends the recast position within `played_by`; 1 is first-listed. */
export type WithRecastOrder<T> = T & { recast_order: number };

/** A movie or TV show a person directed, returned by `/people/{id}/titles`. */
export type PersonTitle = (Movie | TVShow) & { type: 'movie' | 'tvshow'; role: string };

export interface TimelineEntry {
  id: number;
  title: string;
  chronology_order: number | null;
  type: string;
  _links?: ResourceLinks;
}

export interface TimelineGroup {
  continuity: string;
  multiverse_designation: string | null;
  entries: TimelineEntry[];
}

export interface CollectionLinks {
  self?: Link;
  first?: Link;
  prev?: Link;
  next?: Link;
  last?: Link;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  _links?: CollectionLinks;
}

export interface Health {
  status: 'ok' | 'degraded';
  version: string | null;
  uptime: number;
  database: 'up' | 'down';
}

export interface ListParams {
  page?: number;
  /** Defaults to 10 server-side and is capped at 100. */
  limit?: number;
  /** `"column,ASC"` or `"column,DESC"`. */
  order?: string;
  /** `"column=value"` — case-insensitive contains on text columns, exact on numeric. */
  filter?: string;
  continuity?: string;
  multiverse_designation?: string;
}

/** `/movies` and `/tvshows` additionally scope by studio and MCU membership. */
export interface TitleListParams extends ListParams {
  studio?: string;
  is_mcu?: boolean;
}

/** `/people` has no `continuity`/`multiverse_designation` columns to filter by. */
export type PersonListParams = Pick<ListParams, 'page' | 'limit' | 'order' | 'filter'>;

export interface TimelineParams {
  /** Exact match on `multiverse_designation`, e.g. `"Earth-10005"`. */
  multiverse?: string;
}
