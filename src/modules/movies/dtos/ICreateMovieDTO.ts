export default interface ICreateMovieDTO {
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
  post_credit_scenes?: number;
  imdb_id?: string;
  updated_at?: Date;
}
