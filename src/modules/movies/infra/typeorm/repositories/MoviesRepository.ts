import { getRepository, Raw, Repository } from 'typeorm';

import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '@modules/movies/dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '@modules/movies/dtos/IFindAllMoviesResponseDTO';
import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import Movie from '../entities/Movie';

class MoviesRepository implements IMoviesRepository {
  private ormRepository: Repository<Movie>;

  constructor() {
    this.ormRepository = getRepository(Movie);
  }

  public async create(data: ICreateMovieDTO): Promise<Movie> {
    const movie = this.ormRepository.create(data);

    await this.ormRepository.save(movie);

    return movie;
  }

  public async update(movie: Movie): Promise<Movie> {
    return this.ormRepository.save(movie);
  }

  public async findById(id: number): Promise<Movie | undefined> {
    const findMovie = await this.ormRepository.findOne(id, {
      relations: ['related_movies', 'streamings'],
    });

    return findMovie;
  }

  public async findAll({
    page,
    limit,
    columns,
    order,
    filter,
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    const skip = page && limit && (page - 1) * limit;

    const select = columns
      ?.split(',')
      .map(column => column.trim()) as (keyof Movie)[];

    const [columnOrder, sortingOrder = 'ASC'] = order
      ? order.split(',').map(item => item.trim())
      : [];

    const [columnWhere, whereValue] = filter
      ? filter.split('=').map(item => item.trim())
      : [];

    const columnsWithNumericValues = [
      'phase',
      'chronology',
      'box_office',
      'post_credit_scenes',
      'release_date',
    ];
    let formattedColumnValue;
    formattedColumnValue = Raw(alias => `${alias} ILIKE '%${whereValue}%'`);

    if (columnsWithNumericValues.includes(columnWhere)) {
      formattedColumnValue = whereValue;
    }

    const where = columnWhere
      ? {
          [columnWhere]: formattedColumnValue,
        }
      : undefined;

    const [movies, total] = await this.ormRepository.findAndCount({
      ...(limit && { take: limit }),
      ...(skip && { skip }),
      ...(select && { select }),
      ...(where && { where }),
      ...(columnOrder && {
        order: { [columnOrder]: sortingOrder.toUpperCase() },
      }),
    });

    return { data: movies, total };
  }
}

export default MoviesRepository;
