export default interface IUpcomingItemDTO {
  id: number;
  type: 'movie' | 'tvshow';
  title: string;
  release_date: Date;
  overview?: string;
  cover_url?: string;
  continuity?: string;
  multiverse_designation?: string;
  is_mcu?: boolean;
  phase?: number;
  saga?: string;
}
