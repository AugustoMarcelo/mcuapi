import IStreamingAvailability from '../entities/IStreamingAvailability';

export interface IFindByTitleDTO {
  title_id: number;
  /** Uppercase ISO 3166-1 alpha-2. Omit for every region. */
  region?: string;
}

export default interface IStreamingRepository {
  findByMovie(data: IFindByTitleDTO): Promise<IStreamingAvailability[]>;
  findByTVShow(data: IFindByTitleDTO): Promise<IStreamingAvailability[]>;
  /** Distinct regions that have at least one row, ascending. */
  findRegions(): Promise<string[]>;
  /** Distinct provider names, ascending. */
  findProviders(region?: string): Promise<string[]>;
}
