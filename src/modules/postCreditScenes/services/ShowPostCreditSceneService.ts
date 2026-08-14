import { injectable, inject } from 'tsyringe';
import IPostCreditScenesRepository from '../repositories/IPostCreditScenesRepository';
import IPostCreditScene from '../entities/IPostCreditScene';
import AppError from '@shared/errors/AppError';

@injectable()
class ShowPostCreditSceneService {
  constructor(
    @inject('PostCreditScenesRepository')
    private postCreditScenesRepository: IPostCreditScenesRepository,
  ) {}

  public async execute({
    post_credit_scene_id,
  }: {
    post_credit_scene_id: number;
  }): Promise<IPostCreditScene> {
    const postCreditScene =
      await this.postCreditScenesRepository.findById(post_credit_scene_id);

    if (!postCreditScene) {
      throw new AppError('Post-credit scene not found', 404);
    }

    return postCreditScene;
  }
}

export default ShowPostCreditSceneService;
