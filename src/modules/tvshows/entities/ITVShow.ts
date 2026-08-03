import IMovie from '@modules/movies/entities/IMovie';

export default interface ITVShow {
  id: number;
  title: string;
  overview?: string;
  cover_url?: string;
  trailer_url?: string;
  season: number;
  number_episodes: number;
  release_date?: Date;
  last_aired_date?: Date;
  directed_by?: string;
  phase?: number;
  saga?: string;
  chronology?: number;
  imdb_id?: string;
  updated_at?: Date;

  // Multiverse fields
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
  type?: string;

  // Timeline fields
  timeline_chronology_order?: number;

  related_movies?: IMovie[];

  related_tvshows?: ITVShow[];
}
