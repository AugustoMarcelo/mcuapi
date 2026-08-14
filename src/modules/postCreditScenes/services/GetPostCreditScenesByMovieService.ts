import { injectable, inject } from 'tsyringe';
import IPostCreditScenesRepository from '../repositories/IPostCreditScenesRepository';
import IPostCreditScene from '../entities/IPostCreditScene';

@injectable()
class GetPostCreditScenesByMovieService {
  constructor(
    @inject('PostCreditScenesRepository')
    private postCreditScenesRepository: IPostCreditScenesRepository,
  ) {}

  public async execute(movie_id: number): Promise<IPostCreditScene[]> {
    return this.postCreditScenesRepository.findByMovieId(movie_id);
  }
}

export default GetPostCreditScenesByMovieService;
