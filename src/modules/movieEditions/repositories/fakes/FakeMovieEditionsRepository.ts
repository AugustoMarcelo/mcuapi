import IMovieEdition from '../../entities/IMovieEdition';
import IFindMovieEditionsDTO from '../../dtos/IFindMovieEditionsDTO';
import IMovieEditionsRepository from '../IMovieEditionsRepository';

export default class FakeMovieEditionsRepository implements IMovieEditionsRepository {
  private editions: IMovieEdition[] = [];

  public async findAll({
    page,
    limit,
    movie_id,
  }: IFindMovieEditionsDTO): Promise<{ data: IMovieEdition[]; total: number }> {
    const filtered = movie_id
      ? this.editions.filter(edition => edition.movie_id === movie_id)
      : this.editions;
    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
    };
  }

  public async findById(id: number): Promise<IMovieEdition | null> {
    return this.editions.find(edition => edition.id === id) ?? null;
  }

  public add(edition: IMovieEdition): void {
    this.editions.push(edition);
  }
}
