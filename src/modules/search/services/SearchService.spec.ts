import FakeSearchRepository from '../repositories/fakes/FakeSearchRepository';
import SearchService from './SearchService';
import FakeMoviesRepository from '@modules/movies/repositories/fakes/FakeMoviesRepository';
import FakeTVShowsRepository from '@modules/tvshows/repositories/fakes/FakeTVShowsRepository';
import FakeCharactersRepository from '@modules/characters/repositories/fakes/FakeCharactersRepository';
import FakePeopleRepository from '@modules/people/repositories/fakes/FakePeopleRepository';

let fakeSearchRepository: FakeSearchRepository;
let fakeMoviesRepository: FakeMoviesRepository;
let fakeTVShowsRepository: FakeTVShowsRepository;
let fakeCharactersRepository: FakeCharactersRepository;
let fakePeopleRepository: FakePeopleRepository;
let searchService: SearchService;

describe('SearchService', () => {
  beforeEach(() => {
    fakeSearchRepository = new FakeSearchRepository();
    fakeMoviesRepository = new FakeMoviesRepository();
    fakeTVShowsRepository = new FakeTVShowsRepository();
    fakeCharactersRepository = new FakeCharactersRepository();
    fakePeopleRepository = new FakePeopleRepository();

    searchService = new SearchService(
      fakeSearchRepository,
      fakeMoviesRepository,
      fakeTVShowsRepository,
      fakeCharactersRepository,
      fakePeopleRepository,
    );
  });

  it('Should hydrate ranked hits with the full record for each type', async () => {
    const movie = await fakeMoviesRepository.create({
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Favreau',
    });
    const character = await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
    });
    const person = fakePeopleRepository.seedPerson({
      name: 'Robert Downey Jr.',
    });

    fakeSearchRepository.seed([
      { type: 'movie', id: movie.id },
      { type: 'character', id: character.id },
      { type: 'person', id: person.id },
    ]);

    const { data, total } = await searchService.execute({ q: 'Iron Man' });

    expect(total).toBe(3);
    expect(data.map(hit => hit.type)).toEqual(['movie', 'character', 'person']);
    expect(data[0]).toMatchObject({ type: 'movie', title: 'Iron Man' });
    expect(data[1]).toMatchObject({ type: 'character', name: 'Tony Stark' });
    expect(data[2]).toMatchObject({
      type: 'person',
      name: 'Robert Downey Jr.',
    });
  });

  it('Should preserve the rank order returned by the repository', async () => {
    const first = await fakeMoviesRepository.create({
      id: 1,
      title: 'Ant-Man',
      directed_by: 'Peyton Reed',
    });
    const second = await fakeMoviesRepository.create({
      id: 2,
      title: 'Ant-Man and the Wasp',
      directed_by: 'Peyton Reed',
    });

    fakeSearchRepository.seed([
      { type: 'movie', id: second.id },
      { type: 'movie', id: first.id },
    ]);

    const { data } = await searchService.execute({ q: 'Ant-Man' });

    expect(data.map(hit => (hit as { title: string }).title)).toEqual([
      'Ant-Man and the Wasp',
      'Ant-Man',
    ]);
  });

  it('Should drop a hit whose underlying record no longer exists', async () => {
    fakeSearchRepository.seed([{ type: 'movie', id: 999 }]);

    const { data, total } = await searchService.execute({ q: 'Iron Man' });

    expect(data).toHaveLength(0);
    expect(total).toBe(1);
  });

  it('Should narrow to a single type when requested', async () => {
    const movie = await fakeMoviesRepository.create({
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Favreau',
    });
    const character = await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
    });

    fakeSearchRepository.seed([
      { type: 'movie', id: movie.id },
      { type: 'character', id: character.id },
    ]);

    const { data, total } = await searchService.execute({
      q: 'Iron Man',
      type: 'character',
    });

    expect(total).toBe(1);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ type: 'character' });
  });

  it('Should paginate hydrated hits', async () => {
    const movies = await Promise.all(
      ['Iron Man', 'Iron Man 2', 'Iron Man 3'].map((title, index) =>
        fakeMoviesRepository.create({
          id: index + 1,
          title,
          directed_by: 'Jon Favreau',
        }),
      ),
    );

    fakeSearchRepository.seed(
      movies.map(movie => ({ type: 'movie' as const, id: movie.id })),
    );

    const { data, total } = await searchService.execute({
      q: 'Iron Man',
      page: 2,
      limit: 1,
    });

    expect(total).toBe(3);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ title: 'Iron Man 2' });
  });
});
