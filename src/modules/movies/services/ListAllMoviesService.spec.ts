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
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Fraveau',
    });

    fakeMoviesRepository.create({
      id: 2,
      title: 'The Incredible Hulk',
      directed_by: 'Louis Leterrier',
    });

    fakeMoviesRepository.create({
      id: 3,
      title: 'Iron Man II',
      directed_by: 'Jon Favreau',
    });

    const { data, total } = await listAllMovies.execute({});

    expect(data).toHaveLength(3);
    expect(total).toBe(3);
  });

  it('Should be able to list movies sending limit params', async () => {
    fakeMoviesRepository.create({
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Fraveau',
    });

    fakeMoviesRepository.create({
      id: 2,
      title: 'The Incredible Hulk',
      directed_by: 'Louis Leterrier',
    });

    fakeMoviesRepository.create({
      id: 3,
      title: 'Iron Man II',
      directed_by: 'Jon Favreau',
    });

    const { data, total } = await listAllMovies.execute({ page: 1, limit: 1 });

    expect(data).toHaveLength(1);
    expect(total).toBe(3);
  });

  it('Should be able to list only movies attributes with columns passed by query params', async () => {
    fakeMoviesRepository.create({
      id: 1,
      title: 'Iron Man',
      release_date: new Date(),
      box_office: 585171547,
      duration: 126,
      overview:
        "2008's Iron Man tells the story of Tony Stark, a billionaire industrialist and genius inventor who is kidnapped and forced to build a devastating weapon. Instead, using his intelligence and ingenuity, Tony builds a high-tech suit of armor and escapes captivity. When he uncovers a nefarious plot with global implications, he dons his powerful armor and vows to protect the world as Iron Man.",
      cover_url:
        'https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/iron-man.jpg',
      directed_by: 'Jon Favreau',
      phase: 1,
      saga: 'Infinity Saga',
      chronology: 3,
      post_credit_scenes: 1,
    });

    const { data } = await listAllMovies.execute({
      columns: 'title,release_date,cover_url',
    });

    expect(data[0]).not.toHaveProperty('box_office');
    expect(data[0]).not.toHaveProperty('duration');
    expect(data[0]).not.toHaveProperty('overview');
    expect(data[0]).not.toHaveProperty('directed_by');
    expect(data[0]).not.toHaveProperty('phase');
    expect(data[0]).not.toHaveProperty('saga');
    expect(data[0]).not.toHaveProperty('chronology');
    expect(data[0]).not.toHaveProperty('post_credit_scenes');
  });
});
