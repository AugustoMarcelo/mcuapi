import { injectable, inject } from 'tsyringe';
import IPostCreditScenesRepository from '../repositories/IPostCreditScenesRepository';
import IPostCreditScene from '../entities/IPostCreditScene';

@injectable()
class GetPostCreditScenesByTVShowService {
  constructor(
    @inject('PostCreditScenesRepository')
    private postCreditScenesRepository: IPostCreditScenesRepository,
  ) {}

  public async execute(tvshow_id: number): Promise<IPostCreditScene[]> {
    return this.postCreditScenesRepository.findByTVShowId(tvshow_id);
  }
}

export default GetPostCreditScenesByTVShowService;
