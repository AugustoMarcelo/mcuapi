import ITVShow from '@modules/tvshows/entities/ITVShow';

export default interface IMovie {
  id: number;

  title: string;

  release_date?: Date;

  box_office?: number;

  duration?: number;

  overview?: string;

  cover_url?: string;

  trailer_url?: string;

  directed_by: string;

  phase?: number;

  saga?: string;

  chronology?: number;

  post_credit_scenes: number;

  imdb_id?: string;

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

  updated_at?: Date;
}
