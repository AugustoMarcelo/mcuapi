import FakePostCreditScenesRepository from '../repositories/fakes/FakePostCreditScenesRepository';
import GetPostCreditScenesByMovieService from './GetPostCreditScenesByMovieService';

let fakePostCreditScenesRepository: FakePostCreditScenesRepository;
let getPostCreditScenesByMovie: GetPostCreditScenesByMovieService;

describe('GetPostCreditScenesByMovie', () => {
  beforeEach(() => {
    fakePostCreditScenesRepository = new FakePostCreditScenesRepository();
    getPostCreditScenesByMovie = new GetPostCreditScenesByMovieService(
      fakePostCreditScenesRepository,
    );
  });

  it('Should be able to get post-credit scenes for a movie', async () => {
    fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Mid-credits scene.',
      is_stinger: true,
    });
    fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Post-credits scene.',
      is_stinger: false,
    });
    fakePostCreditScenesRepository.seed({
      movie_id: 2,
      description: 'Unrelated scene.',
      is_stinger: false,
    });

    const result = await getPostCreditScenesByMovie.execute(1);

    expect(result).toHaveLength(2);
    expect(result.every(scene => scene.movie_id === 1)).toBe(true);
  });

  it('Should return an empty array when the movie has no post-credit scenes', async () => {
    const result = await getPostCreditScenesByMovie.execute(999);

    expect(result).toHaveLength(0);
  });
});
