export default interface IFindAllMoviesDTO {
  page?: number;
  limit?: number;
  columns?: string;
  order?: string;
  filter?: string;
  studio?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
}
