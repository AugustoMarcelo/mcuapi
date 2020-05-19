import AppError from '@shared/errors/AppError';
import FakeMoviesRepository from '../repositories/fakes/FakeMoviesRepository';
import ShowMovieService from './ShowMovieService';

let fakeMoviesRepository: FakeMoviesRepository;
let showMovie: ShowMovieService;

describe('ShowMovie', () => {
  beforeEach(() => {
    fakeMoviesRepository = new FakeMoviesRepository();
    showMovie = new ShowMovieService(fakeMoviesRepository);
  });

  it('Should be able to show a movie', async () => {
    const movie = await fakeMoviesRepository.create({
      title: 'Iron Man',
      directed_by: 'Jon Fraveau',
    });

    const movieFound = await showMovie.execute({ movie_id: movie.id });

    expect(movie.id).toEqual(movieFound.id);
  });

  it('Should not be able to show a movie with a non-existing id', async () => {
    await expect(
      showMovie.execute({ movie_id: 'non-existing-movie-id' }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
