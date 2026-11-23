import FakeMovieEditionsRepository from '../repositories/fakes/FakeMovieEditionsRepository';
import ShowMovieEditionService from './ShowMovieEditionService';

describe('ShowMovieEditionService', () => {
  it('returns edition by ID', async () => {
    const repository = new FakeMovieEditionsRepository();
    repository.add({
      id: 1,
      movie_id: 22,
      title: 'Encore',
      releases: [],
      teased_movies: [],
    });
    const service = new ShowMovieEditionService(repository);

    await expect(service.execute(1)).resolves.toMatchObject({
      title: 'Encore',
    });
  });

  it('throws when edition does not exist', async () => {
    const service = new ShowMovieEditionService(
      new FakeMovieEditionsRepository(),
    );
    await expect(service.execute(42)).rejects.toThrow(
      'Movie edition not found.',
    );
  });
});
