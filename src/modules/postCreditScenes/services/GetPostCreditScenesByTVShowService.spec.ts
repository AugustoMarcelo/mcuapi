import FakePostCreditScenesRepository from '../repositories/fakes/FakePostCreditScenesRepository';
import GetPostCreditScenesByTVShowService from './GetPostCreditScenesByTVShowService';

let fakePostCreditScenesRepository: FakePostCreditScenesRepository;
let getPostCreditScenesByTVShow: GetPostCreditScenesByTVShowService;

describe('GetPostCreditScenesByTVShow', () => {
  beforeEach(() => {
    fakePostCreditScenesRepository = new FakePostCreditScenesRepository();
    getPostCreditScenesByTVShow = new GetPostCreditScenesByTVShowService(
      fakePostCreditScenesRepository,
    );
  });

  it('Should be able to get post-credit scenes for a tvshow', async () => {
    fakePostCreditScenesRepository.seed({
      tvshow_id: 1,
      description: 'Mid-credits scene.',
      is_stinger: true,
    });
    fakePostCreditScenesRepository.seed({
      tvshow_id: 2,
      description: 'Unrelated scene.',
      is_stinger: false,
    });

    const result = await getPostCreditScenesByTVShow.execute(1);

    expect(result).toHaveLength(1);
    expect(result[0].tvshow_id).toBe(1);
  });

  it('Should return an empty array when the tvshow has no post-credit scenes', async () => {
    const result = await getPostCreditScenesByTVShow.execute(999);

    expect(result).toHaveLength(0);
  });
});
