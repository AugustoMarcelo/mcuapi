import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '@modules/tvshows/dtos/IFindAllTVShowsResponseDTO';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';
import { getRepository, Raw, Repository } from 'typeorm';

class TVShowsRepository implements ITVShowsRepository {
  private ormRepository: Repository<TVShow>;

  constructor() {
    this.ormRepository = getRepository(TVShow);
  }

  public async findById(id: number): Promise<ITVShow | undefined> {
    const tvshow = await this.ormRepository.findOne(id, {
      relations: ['related_movies', 'related_tvshows'],
    });

    return tvshow;
  }

  public async findAll(
    data?: IFindAllTVShowsDTO,
  ): Promise<IFindAllTVShowsResponseDTO> {
    let skip;
    const select = data?.columns
      ?.split(',')
      .map(column => column.trim()) as (keyof TVShow)[];

    const [columnWhere, whereValue] = data?.filter
      ? data?.filter.split('=').map(item => item.trim())
      : [];

    const [columnOrder, sortingOrder = 'ASC'] = data?.order
      ? data?.order.split(',').map(item => item.trim())
      : [];

    const columnsWithNumericValues = [
      'phase',
      'season',
      'number_episodes',
      'release_date',
      'last_aired_date',
      'chronology',
      'timeline_chronology_order',
    ];
    let formattedColumnValue;
    formattedColumnValue = Raw(alias => `${alias} ILIKE :value`, {
      value: `%${whereValue}%`,
    });

    if (columnsWithNumericValues.includes(columnWhere)) {
      formattedColumnValue = whereValue;
    }

    const whereConditions: any = {};

    if (columnWhere) {
      whereConditions[columnWhere] = formattedColumnValue;
    }

    if (data?.studio) {
      whereConditions.studio = data.studio;
    }

    if (data?.continuity) {
      whereConditions.continuity = data.continuity;
    }

    if (data?.multiverse_designation) {
      whereConditions.multiverse_designation = data.multiverse_designation;
    }

    if (data?.is_mcu !== undefined) {
      whereConditions.is_mcu = data.is_mcu;
    }

    const where =
      Object.keys(whereConditions).length > 0 ? whereConditions : undefined;

    if (data?.page && data.limit) {
      const { page, limit } = data;
      skip = page && limit && (page - 1) * limit;
    }

    const [tvshows, total] = await this.ormRepository.findAndCount({
      ...(data?.limit && { take: data.limit }),
      ...(skip && { skip }),
      ...(select && { select }),
      ...(where && { where }),
      ...(columnOrder && {
        order: { [columnOrder]: sortingOrder.toUpperCase() },
      }),
    });

    return { data: tvshows, total };
  }

  public async getStats(): Promise<IRepositoryStatsDTO> {
    const { count, last_updated } = await this.ormRepository
      .createQueryBuilder('tvshow')
      .select('COUNT(*)', 'count')
      .addSelect('MAX(tvshow.updated_at)', 'last_updated')
      .getRawOne();

    const continuityRows: Array<{ continuity: string }> =
      await this.ormRepository
        .createQueryBuilder('tvshow')
        .select('DISTINCT tvshow.continuity', 'continuity')
        .where('tvshow.continuity IS NOT NULL')
        .getRawMany();

    const designationRows: Array<{ multiverse_designation: string }> =
      await this.ormRepository
        .createQueryBuilder('tvshow')
        .select(
          'DISTINCT tvshow.multiverse_designation',
          'multiverse_designation',
        )
        .where('tvshow.multiverse_designation IS NOT NULL')
        .getRawMany();

    return {
      count: Number(count),
      continuities: continuityRows.map(row => row.continuity),
      designations: designationRows.map(row => row.multiverse_designation),
      last_updated: last_updated ? new Date(last_updated) : null,
    };
  }
}

export default TVShowsRepository;
