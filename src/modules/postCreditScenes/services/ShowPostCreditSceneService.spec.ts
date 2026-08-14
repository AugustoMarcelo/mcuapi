import FakePostCreditScenesRepository from '../repositories/fakes/FakePostCreditScenesRepository';
import ShowPostCreditSceneService from './ShowPostCreditSceneService';
import AppError from '@shared/errors/AppError';

let fakePostCreditScenesRepository: FakePostCreditScenesRepository;
let showPostCreditScene: ShowPostCreditSceneService;

describe('ShowPostCreditScene', () => {
  beforeEach(() => {
    fakePostCreditScenesRepository = new FakePostCreditScenesRepository();
    showPostCreditScene = new ShowPostCreditSceneService(
      fakePostCreditScenesRepository,
    );
  });

  it('Should be able to show a post-credit scene by ID', async () => {
    const postCreditScene = fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Nick Fury reveals the Avengers Initiative.',
      is_stinger: false,
    });

    const result = await showPostCreditScene.execute({
      post_credit_scene_id: postCreditScene.id,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(postCreditScene.id);
    expect(result.description).toBe(
      'Nick Fury reveals the Avengers Initiative.',
    );
  });

  it('Should throw AppError when post-credit scene is not found', async () => {
    await expect(
      showPostCreditScene.execute({ post_credit_scene_id: 999 }),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      showPostCreditScene.execute({ post_credit_scene_id: 999 }),
    ).rejects.toHaveProperty('statusCode', 404);
  });
});
