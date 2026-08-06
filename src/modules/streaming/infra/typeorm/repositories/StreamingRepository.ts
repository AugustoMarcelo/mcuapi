import { Repository, getRepository } from 'typeorm';

import IStreamingAvailability from '@modules/streaming/entities/IStreamingAvailability';
import IStreamingRepository, {
  IFindByTitleDTO,
} from '@modules/streaming/repositories/IStreamingRepository';
import StreamingAvailability from '../entities/StreamingAvailability';

class StreamingRepository implements IStreamingRepository {
  private ormRepository: Repository<StreamingAvailability>;

  constructor() {
    this.ormRepository = getRepository(StreamingAvailability);
  }

  private findByColumn(
    column: 'movie_id' | 'tvshow_id',
    { title_id, region }: IFindByTitleDTO,
  ): Promise<StreamingAvailability[]> {
    const where: Record<string, unknown> = { [column]: title_id };
    if (region) where.region = region;

    return this.ormRepository.find({
      where,
      // Stable output.
      order: { region: 'ASC', provider: 'ASC' },
    });
  }

  public async findByMovie(
    data: IFindByTitleDTO,
  ): Promise<IStreamingAvailability[]> {
    return this.findByColumn('movie_id', data);
  }

  public async findByTVShow(
    data: IFindByTitleDTO,
  ): Promise<IStreamingAvailability[]> {
    return this.findByColumn('tvshow_id', data);
  }

  public async findRegions(): Promise<string[]> {
    const rows = await this.ormRepository
      .createQueryBuilder('s')
      .select('DISTINCT s.region', 'region')
      .orderBy('region', 'ASC')
      .getRawMany<{ region: string }>();

    return rows.map(row => row.region);
  }

  public async findProviders(region?: string): Promise<string[]> {
    const query = this.ormRepository
      .createQueryBuilder('s')
      .select('DISTINCT s.provider', 'provider')
      .orderBy('provider', 'ASC');

    if (region) query.where('s.region = :region', { region });

    const rows = await query.getRawMany<{ provider: string }>();
    return rows.map(row => row.provider);
  }
}

export default StreamingRepository;
