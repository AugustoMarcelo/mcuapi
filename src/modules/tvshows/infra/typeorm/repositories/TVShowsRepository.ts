import { FindOptionsWhere, Repository } from 'typeorm';
import AppDataSource from '@shared/infra/typeorm/dataSource';
import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '@modules/tvshows/dtos/IFindAllTVShowsResponseDTO';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import TVSHOW_COLUMNS from '@modules/tvshows/entities/tvshowColumns';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';
import {
  buildOrderFromClauses,
  buildSelectFromColumns,
  buildWhereFromFilter,
} from '@shared/infra/typeorm/listParamsQuery';

class TVShowsRepository implements ITVShowsRepository {
  private ormRepository: Repository<TVShow>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(TVShow);
  }

  public async findById(id: number): Promise<ITVShow | undefined> {
    const tvshow = await this.ormRepository.findOne({
      where: { id },
      relations: { related_movies: true, related_tvshows: true },
    });

    return tvshow ?? undefined;
  }

  public async findAll(
    data?: IFindAllTVShowsDTO,
  ): Promise<IFindAllTVShowsResponseDTO> {
    let skip;

    const orderBy = buildOrderFromClauses(data?.order);

    const whereConditions = buildWhereFromFilter(data?.filter, TVSHOW_COLUMNS);

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
      Object.keys(whereConditions).length > 0
        ? (whereConditions as FindOptionsWhere<TVShow>)
        : undefined;

    if (data?.page && data.limit) {
      const { page, limit } = data;
      skip = page && limit && (page - 1) * limit;
    }

    const select = buildSelectFromColumns(data?.columns);

    const [tvshows, total] = await this.ormRepository.findAndCount({
      ...(data?.limit && { take: data.limit }),
      ...(skip && { skip }),
      ...(select && { select }),
      ...(where && { where }),
      ...(orderBy && { order: orderBy }),
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
