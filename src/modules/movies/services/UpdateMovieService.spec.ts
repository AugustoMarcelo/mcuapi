import AppError from '@shared/errors/AppError';
import FakeMoviesRepository from '../repositories/fakes/FakeMoviesRepository';
import UpdateMovieService from './UpdateMovieService';

let fakeMoviesRepository: FakeMoviesRepository;
let updateMovie: UpdateMovieService;

describe('UpdateMovie', () => {
  beforeEach(() => {
    fakeMoviesRepository = new FakeMoviesRepository();
    updateMovie = new UpdateMovieService(fakeMoviesRepository);
  });

  it('Should be able to update a movie', async () => {
    const movie = await fakeMoviesRepository.create({
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Favreau',
    });

    const movie2 = await fakeMoviesRepository.create({
      id: 23,
      title: 'Avengers: Infinity War',
      directed_by: 'Russo Brothers',
    });

    const updatedMovie = await updateMovie.execute({
      movie_id: movie.id,
      title: 'Iron Man',
      directed_by: 'Jon Favreau',
      post_credit_scenes: 1,
    });

    const updatedMovie2 = await updateMovie.execute({
      movie_id: movie2.id,
    });

    expect(updatedMovie.title).toBe('Iron Man');
    expect(updatedMovie.directed_by).toBe('Jon Favreau');
    expect(updatedMovie.post_credit_scenes).toBe(1);
    expect(updatedMovie2.title).toBe(updatedMovie2.title);
    expect(updatedMovie2.duration).toBe(updatedMovie2.duration);
  });

  it('Should not be able to update a movie from non-existing movie', async () => {
    await expect(
      updateMovie.execute({
        movie_id: 100,
        title: 'Iron Man',
        directed_by: 'Jon Favreau',
        post_credit_scenes: 1,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
