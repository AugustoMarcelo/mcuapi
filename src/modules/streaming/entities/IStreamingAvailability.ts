export default interface IStreamingAvailability {
  id: number;
  /** Exactly one of `movie_id` / `tvshow_id` is set. */
  movie_id: number | null;
  tvshow_id: number | null;
  /** ISO 3166-1 alpha-2, uppercase. */
  region: string;
  provider: string;
  url: string | null;
  created_at: Date;
  updated_at: Date;
}
