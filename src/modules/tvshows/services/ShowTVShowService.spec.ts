import mockTVShow from '@modules/tvshows/utils/mockTVShow';
import AppError from '@shared/errors/AppError';
import FakeTVShowsRepository from '../repositories/fakes/FakeTVShowsRepository';
import ShowTVShowService from './ShowTVShowService';

let fakeTVShowsRepository: FakeTVShowsRepository;
let showTVShow: ShowTVShowService;

describe('ShowTVShowService', () => {
  it('Should be able to show a tv show', async () => {
    const fakeTVShow = mockTVShow();
    fakeTVShowsRepository = new FakeTVShowsRepository([fakeTVShow]);
    showTVShow = new ShowTVShowService(fakeTVShowsRepository);

    const tvshowFound = await showTVShow.execute({ tvshow_id: fakeTVShow.id });

    expect(tvshowFound.id).toEqual(fakeTVShow.id);
  });

  it('Should not be able to show a tv show with a non-existing id', async () => {
    await expect(showTVShow.execute({ tvshow_id: 100 })).rejects.toBeInstanceOf(
      AppError,
    );
  });
});
