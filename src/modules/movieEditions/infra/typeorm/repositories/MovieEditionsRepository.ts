import { Repository } from 'typeorm';
import MovieEdition from '../entities/MovieEdition';
import AppDataSource from '@shared/infra/typeorm/dataSource';
import IMovieEdition from '@modules/movieEditions/entities/IMovieEdition';
import IFindMovieEditionsDTO from '@modules/movieEditions/dtos/IFindMovieEditionsDTO';
import IMovieEditionsRepository from '@modules/movieEditions/repositories/IMovieEditionsRepository';

export default class MovieEditionsRepository implements IMovieEditionsRepository {
  private ormRepository: Repository<MovieEdition>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(MovieEdition);
  }

  public async findAll({
    page,
    limit,
    movie_id,
  }: IFindMovieEditionsDTO): Promise<{ data: IMovieEdition[]; total: number }> {
    const query = this.ormRepository
      .createQueryBuilder('edition')
      .leftJoinAndSelect('edition.releases', 'release')
      .leftJoinAndSelect('edition.teases', 'tease')
      .leftJoinAndSelect('tease.movie', 'movie')
      .orderBy('edition.id', 'ASC')
      .addOrderBy('release.release_date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (movie_id) query.where('edition.movie_id = :movie_id', { movie_id });
    const [editions, total] = await query.getManyAndCount();
    return { data: editions.map(this.present), total };
  }

  public async findById(id: number): Promise<IMovieEdition | null> {
    const edition = await this.ormRepository
      .createQueryBuilder('edition')
      .leftJoinAndSelect('edition.releases', 'release')
      .leftJoinAndSelect('edition.teases', 'tease')
      .leftJoinAndSelect('tease.movie', 'movie')
      .where('edition.id = :id', { id })
      .orderBy('release.release_date', 'ASC')
      .getOne();
    return edition ? this.present(edition) : null;
  }

  private present(edition: MovieEdition): IMovieEdition {
    return {
      id: edition.id,
      movie_id: edition.movie_id,
      title: edition.title,
      description: edition.description,
      releases: edition.releases.map(({ id, channel, release_date }) => ({
        id,
        channel,
        release_date,
      })),
      teased_movies: edition.teases.map(({ movie }) => ({
        id: movie.id,
        title: movie.title,
      })),
      created_at: edition.created_at,
      updated_at: edition.updated_at,
    };
  }
}
