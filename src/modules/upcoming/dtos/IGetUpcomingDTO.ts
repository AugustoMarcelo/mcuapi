export default interface IGetUpcomingDTO {
  page?: number;
  limit?: number;
  type?: 'movie' | 'tvshow';
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
}
