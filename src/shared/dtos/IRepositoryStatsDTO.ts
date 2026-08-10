export default interface IRepositoryStatsDTO {
  count: number;
  continuities?: string[];
  designations: string[];
  last_updated: Date | null;
}
