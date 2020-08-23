import FakeMoviesRepository from '../repositories/fakes/FakeMoviesRepository';
import CreateMovieService from './CreateMovieService';

let fakeMoviesRepository: FakeMoviesRepository;
let createMovie: CreateMovieService;

describe('CreateMovie', () => {
  beforeEach(() => {
    fakeMoviesRepository = new FakeMoviesRepository();
    createMovie = new CreateMovieService(fakeMoviesRepository);
  });

  it('Should be able to create a new movie', async () => {
    const movie = await createMovie.execute({
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Fraveu',
    });

    expect(movie).toHaveProperty('id');
  });
});
