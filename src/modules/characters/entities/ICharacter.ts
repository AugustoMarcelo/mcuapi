export default interface ICharacter {
  id: number;
  name: string;
  alias?: string;
  description?: string;
  image_url?: string;
  played_by?: string;
  continuity?: string;
  multiverse_designation?: string;
  variant_of?: number;
  first_appearance_movie_id?: number;
  first_appearance_tvshow_id?: number;
  created_at?: Date;
  updated_at?: Date;
} 