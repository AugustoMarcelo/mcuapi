import { Repository, FindOptionsWhere } from 'typeorm';

import PostCreditScene from '../entities/PostCreditScene';
import AppDataSource from '@shared/infra/typeorm/dataSource';
import IPostCreditScenesRepository from '@modules/postCreditScenes/repositories/IPostCreditScenesRepository';
import IFindAllPostCreditScenesDTO from '@modules/postCreditScenes/dtos/IFindAllPostCreditScenesDTO';
import IFindAllPostCreditScenesResponseDTO from '@modules/postCreditScenes/dtos/IFindAllPostCreditScenesResponseDTO';
import POST_CREDIT_SCENE_COLUMNS from '@modules/postCreditScenes/entities/postCreditSceneColumns';
import {
  buildOrderFromClauses,
  buildSelectFromColumns,
  buildWhereFromFilter,
} from '@shared/infra/typeorm/listParamsQuery';

class PostCreditScenesRepository implements IPostCreditScenesRepository {
  private ormRepository: Repository<PostCreditScene>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(PostCreditScene);
  }

  public async findById(id: number): Promise<PostCreditScene | undefined> {
    const postCreditScene = await this.ormRepository.findOne({
      where: { id },
    });

    return postCreditScene ?? undefined;
  }

  public async findAll({
    page,
    limit,
    columns,
    order,
    filter,
  }: IFindAllPostCreditScenesDTO): Promise<IFindAllPostCreditScenesResponseDTO> {
    const skip = page && limit && (page - 1) * limit;

    const orderBy = buildOrderFromClauses(order);

    const whereConditions = buildWhereFromFilter(
      filter,
      POST_CREDIT_SCENE_COLUMNS,
    );

    const where =
      Object.keys(whereConditions).length > 0
        ? (whereConditions as FindOptionsWhere<PostCreditScene>)
        : undefined;

    const select = buildSelectFromColumns(columns);

    const [postCreditScenes, total] = await this.ormRepository.findAndCount({
      ...(limit && { take: limit }),
      ...(skip && { skip }),
      ...(select && { select }),
      ...(where && { where }),
      ...(orderBy && { order: orderBy }),
    });

    return { data: postCreditScenes, total };
  }

  public async findByMovieId(movie_id: number): Promise<PostCreditScene[]> {
    return this.ormRepository.find({
      where: { movie_id },
      order: { is_stinger: 'DESC', id: 'ASC' },
    });
  }

  public async findByTVShowId(tvshow_id: number): Promise<PostCreditScene[]> {
    return this.ormRepository.find({
      where: { tvshow_id },
      order: { is_stinger: 'DESC', id: 'ASC' },
    });
  }
}

export default PostCreditScenesRepository;
