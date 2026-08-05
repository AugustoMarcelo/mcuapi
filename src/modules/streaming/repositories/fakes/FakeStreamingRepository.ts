import IStreamingAvailability from '@modules/streaming/entities/IStreamingAvailability';
import IStreamingRepository, { IFindByTitleDTO } from '../IStreamingRepository';

class FakeStreamingRepository implements IStreamingRepository {
  private rows: IStreamingAvailability[] = [];

  private nextId = 1;

  /** Test seam — seeds a row without going through a create path. */
  public seed(row: Partial<IStreamingAvailability>): IStreamingAvailability {
    const created: IStreamingAvailability = {
      id: this.nextId,
      movie_id: null,
      tvshow_id: null,
      region: 'US',
      provider: 'Disney+',
      offer_type: 'subscription',
      url: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...row,
    };

    this.nextId += 1;
    this.rows.push(created);
    return created;
  }

  private static sort(
    rows: IStreamingAvailability[],
  ): IStreamingAvailability[] {
    return [...rows].sort(
      (a, b) =>
        a.region.localeCompare(b.region) ||
        a.offer_type.localeCompare(b.offer_type) ||
        a.provider.localeCompare(b.provider),
    );
  }

  public async findByMovie({
    title_id,
    region,
  }: IFindByTitleDTO): Promise<IStreamingAvailability[]> {
    return FakeStreamingRepository.sort(
      this.rows.filter(
        row => row.movie_id === title_id && (!region || row.region === region),
      ),
    );
  }

  public async findByTVShow({
    title_id,
    region,
  }: IFindByTitleDTO): Promise<IStreamingAvailability[]> {
    return FakeStreamingRepository.sort(
      this.rows.filter(
        row => row.tvshow_id === title_id && (!region || row.region === region),
      ),
    );
  }

  private static unique(values: string[]): string[] {
    // No Set spreading: the API build targets ES5.
    return values.filter((value, i) => values.indexOf(value) === i).sort();
  }

  public async findRegions(): Promise<string[]> {
    return FakeStreamingRepository.unique(this.rows.map(row => row.region));
  }

  public async findProviders(region?: string): Promise<string[]> {
    return FakeStreamingRepository.unique(
      this.rows
        .filter(row => !region || row.region === region)
        .map(row => row.provider),
    );
  }
}

export default FakeStreamingRepository;
