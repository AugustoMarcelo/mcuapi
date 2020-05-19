import FakeMoviesRepository from '../repositories/fakes/FakeMoviesRepository';
import ListAllMoviesService from './ListAllMoviesService';

let fakeMoviesRepository: FakeMoviesRepository;
let listAllMovies: ListAllMoviesService;

describe('ListAllMovies', () => {
  beforeEach(() => {
    fakeMoviesRepository = new FakeMoviesRepository();
    listAllMovies = new ListAllMoviesService(fakeMoviesRepository);
  });

  it('Should be able to list movies', async () => {
    fakeMoviesRepository.create({
      title: 'Iron Man',
      directed_by: 'Jon Fraveau',
    });

    fakeMoviesRepository.create({
      title: 'The Incredible Hulk',
      directed_by: 'Louis Leterrier',
    });

    fakeMoviesRepository.create({
      title: 'Iron Man II',
      directed_by: 'Jon Favreau',
    });

    const { data, total } = await listAllMovies.execute({});

    expect(data).toHaveLength(3);
    expect(total).toBe(3);
  });

  it('Should be able to list movies sending limit params', async () => {
    fakeMoviesRepository.create({
      title: 'Iron Man',
      directed_by: 'Jon Fraveau',
    });

    fakeMoviesRepository.create({
      title: 'The Incredible Hulk',
      directed_by: 'Louis Leterrier',
    });

    fakeMoviesRepository.create({
      title: 'Iron Man II',
      directed_by: 'Jon Favreau',
    });

    const { data, total } = await listAllMovies.execute({ page: 1, limit: 1 });

    expect(data).toHaveLength(1);
    expect(total).toBe(3);
  });
});
