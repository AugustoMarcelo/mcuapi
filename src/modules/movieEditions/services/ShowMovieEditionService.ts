import { inject, injectable } from 'tsyringe';
import IMovieEditionsRepository from '../repositories/IMovieEditionsRepository';
import IMovieEdition from '../entities/IMovieEdition';
import AppError from '@shared/errors/AppError';

@injectable()
export default class ShowMovieEditionService {
  constructor(
    @inject('MovieEditionsRepository')
    private repository: IMovieEditionsRepository,
  ) {}

  public async execute(id: number): Promise<IMovieEdition> {
    const edition = await this.repository.findById(id);
    if (!edition) throw new AppError('Movie edition not found.', 404);
    return edition;
  }
}
