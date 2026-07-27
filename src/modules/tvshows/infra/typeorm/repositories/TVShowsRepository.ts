import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '@modules/tvshows/dtos/IFindAllTVShowsResponseDTO';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import { getRepository, Raw, Repository } from 'typeorm';

class TVShowsRepository implements ITVShowsRepository {
  private ormRepository: Repository<TVShow>;

  constructor() {
    this.ormRepository = getRepository(TVShow);
  }

  public async findById(id: number): Promise<ITVShow | undefined> {
    const tvshow = await this.ormRepository.findOne(id, {
      relations: ['related_movies'],
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
    formattedColumnValue = Raw(alias => `${alias} ILIKE :value`, { value: `%${whereValue}%` });

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

    const where = Object.keys(whereConditions).length > 0 ? whereConditions : undefined;

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
}

export default TVShowsRepository;
