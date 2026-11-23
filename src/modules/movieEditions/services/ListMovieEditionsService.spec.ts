import FakeMovieEditionsRepository from '../repositories/fakes/FakeMovieEditionsRepository';
import ListMovieEditionsService from './ListMovieEditionsService';

describe('ListMovieEditionsService', () => {
  it('returns editions and total from repository', async () => {
    const repository = new FakeMovieEditionsRepository();
    repository.add({
      id: 1,
      movie_id: 22,
      title: 'Encore',
      releases: [],
      teased_movies: [],
    });
    const service = new ListMovieEditionsService(repository);

    await expect(service.execute({ page: 1, limit: 10 })).resolves.toEqual({
      data: [
        {
          id: 1,
          movie_id: 22,
          title: 'Encore',
          releases: [],
          teased_movies: [],
        },
      ],
      total: 1,
    });
  });
});
