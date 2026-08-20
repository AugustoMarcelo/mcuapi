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
  movie?: Link;
  tvshow?: Link;
  teases?: Link;
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

/**
 * Appearance endpoints append the join row's `role_type` to each record, plus
 * `appeared_in` — the reality the appearance actually happened in, which only
 * differs from the title's own `multiverse_designation` for the rare
 * per-appearance exception (e.g. the Void sequences in Deadpool & Wolverine).
 */
export type WithRole<T> = T & { role_type: string | null; appeared_in?: string };

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

export interface PostCreditScene {
  id: number;
  /** Exactly one of movie_id/tvshow_id is set — the title the scene appears in. */
  movie_id: number | null;
  tvshow_id: number | null;
  description: string;
  /** At most one of these is set — the title this scene sets up, if any. */
  teases_movie_id: number | null;
  teases_tvshow_id: number | null;
  /** true = mid-credits scene, false = final post-credits scene. */
  is_stinger: boolean;
  created_at: string;
  updated_at: string;
  _links?: ResourceLinks;
}

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

/**
 * `/movies` and `/tvshows` additionally scope by studio and MCU membership.
 * `/titles` reuses this exact shape, plus `type` to scope to one of the two.
 */
export interface TitleListParams extends ListParams {
  studio?: string;
  is_mcu?: boolean;
  type?: 'movie' | 'tvshow';
}

/** `/people` has no `continuity`/`multiverse_designation` columns to filter by. */
export type PersonListParams = Pick<ListParams, 'page' | 'limit' | 'order' | 'filter'>;

/** `/post-credit-scenes` has no `continuity`/`multiverse_designation` columns to filter by. */
export type PostCreditSceneListParams = Pick<
  ListParams,
  'page' | 'limit' | 'order' | 'filter'
>;

export interface TimelineParams {
  /** Exact match on `multiverse_designation`, e.g. `"Earth-10005"`. */
  multiverse?: string;
}

/**
 * `/upcoming` merges movies and TV shows whose `release_date` is strictly in
 * the future, sorted ascending. Titles with no announced `release_date` are
 * excluded rather than sorted to either end, so `release_date` is never null
 * here even though it's nullable on `Movie`/`TVShow`.
 */
export interface UpcomingItem {
  id: number;
  type: 'movie' | 'tvshow';
  title: string;
  release_date: string;
  overview: string | null;
  cover_url: string | null;
  continuity: string | null;
  multiverse_designation: string | null;
  is_mcu: boolean;
  phase: number | null;
  saga: string | null;
  _links?: ResourceLinks;
}

/**
 * `/titles` merges movies and TV shows into one paged, filterable collection
 * — the same lean shape as `UpcomingItem`, but `release_date` can be null
 * for announced-but-undated titles (e.g. Blade), which `/titles` includes
 * (sorted last) instead of excluding.
 */
export interface TitleItem {
  id: number;
  type: 'movie' | 'tvshow';
  title: string;
  release_date: string | null;
  overview: string | null;
  cover_url: string | null;
  continuity: string | null;
  multiverse_designation: string | null;
  is_mcu: boolean;
  phase: number | null;
  saga: string | null;
  _links?: ResourceLinks;
}

export interface UpcomingParams {
  page?: number;
  /** Defaults to 10 server-side and is capped at 100. */
  limit?: number;
  type?: 'movie' | 'tvshow';
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
}

/** Dataset-wide counts returned by `/stats`. */
export interface Stats {
  movies: number;
  tvshows: number;
  characters: number;
  people: number;
  /** movies + tvshows. */
  titles: number;
  /** Distinct non-null `continuity` across movies + tvshows only. */
  continuities: number;
  /** Distinct non-null `multiverse_designation` across movies + tvshows + characters. */
  designations: number;
  /** Max `updated_at` across movies, tvshows and characters; null when all three are empty. */
  last_updated: string | null;
  _links?: ResourceLinks;
}
