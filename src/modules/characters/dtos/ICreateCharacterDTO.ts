export default interface ICreateCharacterDTO {
  name: string;
  alias?: string;
  description?: string;
  image_url?: string;
  continuity?: string;
  multiverse_designation?: string;
  variant_of?: number;
  first_appearance_movie_id?: number;
  first_appearance_tvshow_id?: number;
}
