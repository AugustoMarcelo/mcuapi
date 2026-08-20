export default interface ITitleItemDTO {
  id: number;
  type: 'movie' | 'tvshow';
  title: string;
  release_date?: Date;
  overview?: string;
  cover_url?: string;
  trailer_url?: string;
  directed_by?: string;
  phase?: number;
  saga?: string;
  chronology?: number;
  post_credit_scenes?: number;
  imdb_id?: string;
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
  timeline_chronology_order?: number;
  updated_at?: Date;
}
