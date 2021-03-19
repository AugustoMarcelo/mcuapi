import { getRepository, Raw, Repository } from 'typeorm';
import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '@modules/tvshows/dtos/IFindAllTVShowsResponseDTO';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';

class TVShowsRepository implements ITVShowsRepository {
  private ormRepository: Repository<ITVShow>;

  constructor() {
    this.ormRepository = getRepository(TVShow);
  }

  public async findById(id: number): Promise<ITVShow | undefined> {
    const tvshow = await this.ormRepository.findOne(id);

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

    const where = columnWhere
      ? {
          [columnWhere]: Raw(alias => `${alias} ILIKE '%${whereValue}%'`),
        }
      : undefined;

    if (data?.page && data.limit) {
      const { page, limit } = data;
      skip = page && limit && (page - 1) * limit;
    }

    const [tvshows, total] = await this.ormRepository.findAndCount({
      take: data?.limit,
      skip,
      select: select || undefined,
      where: where || undefined,
      order: columnOrder
        ? { [columnOrder]: sortingOrder.toUpperCase() }
        : undefined,
    });

    return { data: tvshows, total };
  }
}

export default TVShowsRepository;
