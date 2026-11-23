import { inject, injectable } from 'tsyringe';
import IMovieEditionsRepository from '../repositories/IMovieEditionsRepository';
import IFindMovieEditionsDTO from '../dtos/IFindMovieEditionsDTO';
import IMovieEdition from '../entities/IMovieEdition';

@injectable()
export default class ListMovieEditionsService {
  constructor(
    @inject('MovieEditionsRepository')
    private repository: IMovieEditionsRepository,
  ) {}

  public execute(
    data: IFindMovieEditionsDTO,
  ): Promise<{ data: IMovieEdition[]; total: number }> {
    return this.repository.findAll(data);
  }
}
