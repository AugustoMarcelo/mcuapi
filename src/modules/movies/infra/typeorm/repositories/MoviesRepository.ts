import { Repository, getRepository, FindConditions } from 'typeorm';

import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '@modules/movies/dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '@modules/movies/dtos/IFindAllMoviesResponseDTO';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';
import MOVIE_COLUMNS from '@modules/movies/entities/movieColumns';
import {
  buildOrderFromClauses,
  buildWhereFromFilter,
} from '@shared/infra/typeorm/listParamsQuery';
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
      relations: ['related_movies', 'related_tvshows'],
    });

    return findMovie;
  }

  public async findAll({
    page,
    limit,
    columns,
    order,
    filter,
    studio,
    continuity,
    multiverse_designation,
    is_mcu,
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    const skip = page && limit && (page - 1) * limit;

    const orderBy = buildOrderFromClauses(order);

    const whereConditions = buildWhereFromFilter(filter, MOVIE_COLUMNS);

    if (studio) {
      whereConditions.studio = studio;
    }

    if (continuity) {
      whereConditions.continuity = continuity;
    }

    if (multiverse_designation) {
      whereConditions.multiverse_designation = multiverse_designation;
    }

    if (is_mcu !== undefined) {
      whereConditions.is_mcu = is_mcu;
    }

    const where =
      Object.keys(whereConditions).length > 0
        ? (whereConditions as FindConditions<Movie>)
        : undefined;

    const [movies, total] = await this.ormRepository.findAndCount({
      ...(limit && { take: limit }),
      ...(skip && { skip }),
      ...(columns && { select: columns }),
      ...(where && { where }),
      ...(orderBy && { order: orderBy }),
    });

    return { data: movies, total };
  }

  public async getStats(): Promise<IRepositoryStatsDTO> {
    const { count, last_updated } = await this.ormRepository
      .createQueryBuilder('movie')
      .select('COUNT(*)', 'count')
      .addSelect('MAX(movie.updated_at)', 'last_updated')
      .getRawOne();

    const continuityRows: Array<{ continuity: string }> =
      await this.ormRepository
        .createQueryBuilder('movie')
        .select('DISTINCT movie.continuity', 'continuity')
        .where('movie.continuity IS NOT NULL')
        .getRawMany();

    const designationRows: Array<{ multiverse_designation: string }> =
      await this.ormRepository
        .createQueryBuilder('movie')
        .select(
          'DISTINCT movie.multiverse_designation',
          'multiverse_designation',
        )
        .where('movie.multiverse_designation IS NOT NULL')
        .getRawMany();

    return {
      count: Number(count),
      continuities: continuityRows.map(row => row.continuity),
      designations: designationRows.map(row => row.multiverse_designation),
      last_updated: last_updated ? new Date(last_updated) : null,
    };
  }
}

export default MoviesRepository;
