export default interface IFindAllCharactersDTO {
  page?: number;
  limit?: number;
  columns?: string;
  order?: string;
  filter?: string;
  continuity?: string;
  multiverse_designation?: string;
} 