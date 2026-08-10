export default interface IStatsResponseDTO {
  movies: number;
  tvshows: number;
  characters: number;
  titles: number;
  continuities: number;
  designations: number;
  last_updated: Date | null;
}
