import IPostCreditScene from '@modules/postCreditScenes/entities/IPostCreditScene';
import POST_CREDIT_SCENE_COLUMNS from '@modules/postCreditScenes/entities/postCreditSceneColumns';
import IPostCreditScenesRepository from '@modules/postCreditScenes/repositories/IPostCreditScenesRepository';
import IFindAllPostCreditScenesDTO from '@modules/postCreditScenes/dtos/IFindAllPostCreditScenesDTO';
import IFindAllPostCreditScenesResponseDTO from '@modules/postCreditScenes/dtos/IFindAllPostCreditScenesResponseDTO';
import compareValues from '@shared/utils/compareValues';

class FakePostCreditScenesRepository implements IPostCreditScenesRepository {
  private postCreditScenes: IPostCreditScene[] = [];

  public seed(data: Omit<IPostCreditScene, 'id'>): IPostCreditScene {
    const postCreditScene: IPostCreditScene = {
      id: this.postCreditScenes.length + 1,
      created_at: new Date(),
      updated_at: new Date(),
      ...data,
    };

    this.postCreditScenes.push(postCreditScene);

    return postCreditScene;
  }

  public async findById(id: number): Promise<IPostCreditScene | undefined> {
    return this.postCreditScenes.find(
      postCreditScene => postCreditScene.id === id,
    );
  }

  public async findAll({
    page = 1,
    limit = 10,
    columns,
    filter,
    order,
  }: IFindAllPostCreditScenesDTO): Promise<IFindAllPostCreditScenesResponseDTO> {
    let filtered = [...this.postCreditScenes];

    filter?.forEach(({ column, value }) => {
      filtered = filtered.filter(postCreditScene => {
        const columnValue = postCreditScene[column];

        if (columnValue === undefined || columnValue === null) {
          return false;
        }

        return POST_CREDIT_SCENE_COLUMNS[column] === 'exact'
          ? String(columnValue) === value
          : String(columnValue).toLowerCase().includes(value.toLowerCase());
      });
    });

    if (order?.length) {
      filtered = [...filtered].sort((a, b) => {
        const clause = order.find(
          ({ column }) => compareValues(a[column], b[column]) !== 0,
        );

        if (!clause) return 0;

        const comparison = compareValues(a[clause.column], b[clause.column]);

        return clause.direction === 'ASC' ? comparison : -comparison;
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    let paginated = filtered.slice(startIndex, endIndex);

    if (columns) {
      paginated = paginated.map(postCreditScene => {
        const projected: Partial<IPostCreditScene> = {};

        columns.forEach(column => {
          Object.assign(projected, { [column]: postCreditScene[column] });
        });

        return projected as IPostCreditScene;
      });
    }

    return { data: paginated, total: filtered.length };
  }

  public async findByMovieId(movie_id: number): Promise<IPostCreditScene[]> {
    return this.postCreditScenes
      .filter(postCreditScene => postCreditScene.movie_id === movie_id)
      .sort((a, b) => Number(b.is_stinger) - Number(a.is_stinger));
  }

  public async findByTVShowId(tvshow_id: number): Promise<IPostCreditScene[]> {
    return this.postCreditScenes
      .filter(postCreditScene => postCreditScene.tvshow_id === tvshow_id)
      .sort((a, b) => Number(b.is_stinger) - Number(a.is_stinger));
  }
}

export default FakePostCreditScenesRepository;
