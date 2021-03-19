export default interface ITVShow {
  id: number;
  title: string;
  overview?: string;
  cover_url?: string;
  trailer_url?: string;
  number_seasons: number;
  number_episodes: number;
  release_date?: Date;
  last_aired_date?: Date;
  directed_by?: string;
  phase?: number;
  saga?: string;
}
