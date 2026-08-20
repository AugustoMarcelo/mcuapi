import FakeTitlesRepository from '../repositories/fakes/FakeTitlesRepository';
import ListAllTitlesService from './ListAllTitlesService';

let fakeTitlesRepository: FakeTitlesRepository;
let listAllTitles: ListAllTitlesService;

describe('ListAllTitles', () => {
  beforeEach(() => {
    fakeTitlesRepository = new FakeTitlesRepository();
    listAllTitles = new ListAllTitlesService(fakeTitlesRepository);
  });

  it('Should be able to list movies and tvshows merged into one collection', async () => {
    fakeTitlesRepository.seed({ id: 1, type: 'movie', title: 'Iron Man' });
    fakeTitlesRepository.seed({ id: 8, type: 'tvshow', title: 'Loki' });

    const { data, total } = await listAllTitles.execute({});

    expect(data).toHaveLength(2);
    expect(total).toBe(2);
    expect(data.map(item => item.type)).toEqual(
      expect.arrayContaining(['movie', 'tvshow']),
    );
  });

  it('Should be able to paginate results', async () => {
    fakeTitlesRepository.seed({ id: 1, type: 'movie', title: 'Iron Man' });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'The Incredible Hulk',
    });
    fakeTitlesRepository.seed({ id: 3, type: 'movie', title: 'Iron Man II' });

    const { data, total } = await listAllTitles.execute({ page: 1, limit: 1 });

    expect(data).toHaveLength(1);
    expect(total).toBe(3);
  });

  it('Should be able to filter by type', async () => {
    fakeTitlesRepository.seed({ id: 1, type: 'movie', title: 'Iron Man' });
    fakeTitlesRepository.seed({ id: 8, type: 'tvshow', title: 'Loki' });

    const { data, total } = await listAllTitles.execute({ type: 'tvshow' });

    expect(total).toBe(1);
    expect(data[0].title).toBe('Loki');
  });

  it('Should be able to filter by studio', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      studio: 'Marvel Studios',
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'Deadpool',
      studio: 'Fox',
    });

    const { data, total } = await listAllTitles.execute({ studio: 'Fox' });

    expect(total).toBe(1);
    expect(data[0].title).toBe('Deadpool');
  });

  it('Should be able to filter by continuity', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      continuity: 'MCU',
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'Ghost Rider',
      continuity: 'Ghost Rider',
    });

    const { data, total } = await listAllTitles.execute({ continuity: 'MCU' });

    expect(total).toBe(1);
    expect(data[0].title).toBe('Iron Man');
  });

  it('Should be able to filter by multiverse_designation', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      multiverse_designation: 'Earth-616',
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'Some FOX title',
      multiverse_designation: 'Earth-10005',
    });

    const { data, total } = await listAllTitles.execute({
      multiverse_designation: 'Earth-10005',
    });

    expect(total).toBe(1);
    expect(data[0].title).toBe('Some FOX title');
  });

  it('Should be able to filter by is_mcu', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      is_mcu: true,
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'Ghost Rider',
      is_mcu: false,
    });

    const { data, total } = await listAllTitles.execute({ is_mcu: false });

    expect(total).toBe(1);
    expect(data[0].title).toBe('Ghost Rider');
  });

  it('Should be able to filter by multiple generic filter clauses', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      phase: 1,
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'Iron Man II',
      phase: 2,
    });

    const { data, total } = await listAllTitles.execute({
      filter: [
        { column: 'title', value: 'Iron' },
        { column: 'phase', value: '1' },
      ],
    });

    expect(total).toBe(1);
    expect(data[0].id).toBe(1);
  });

  it('Should be able to order by multiple columns', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      phase: 2,
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'tvshow',
      title: 'The Incredible Hulk',
      phase: 1,
    });
    fakeTitlesRepository.seed({
      id: 3,
      type: 'movie',
      title: 'Iron Man II',
      phase: 1,
    });

    const { data } = await listAllTitles.execute({
      order: [
        { column: 'phase', direction: 'ASC' },
        { column: 'title', direction: 'DESC' },
      ],
    });

    expect(data.map(item => item.id)).toEqual([2, 3, 1]);
  });

  it('Should be able to select only the requested columns', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      studio: 'Marvel Studios',
      chronology: 3,
    });

    const { data } = await listAllTitles.execute({
      columns: ['title', 'studio'],
    });

    expect(data[0].title).toBe('Iron Man');
    expect(data[0].studio).toBe('Marvel Studios');
    expect(data[0].chronology).toBeUndefined();
  });

  it('Should default to sorting by release_date ascending with undated titles last', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Blade',
      release_date: undefined,
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'Avengers: Doomsday',
      release_date: new Date('2026-12-18'),
    });

    const { data } = await listAllTitles.execute({});

    expect(data.map(item => item.title)).toEqual([
      'Avengers: Doomsday',
      'Blade',
    ]);
  });

  it('Should apply a release_date > today predicate when releaseDateAfter is passed', async () => {
    fakeTitlesRepository.seed({
      id: 1,
      type: 'movie',
      title: 'Iron Man',
      release_date: new Date('2008-05-02'),
    });
    fakeTitlesRepository.seed({
      id: 2,
      type: 'movie',
      title: 'Avengers: Doomsday',
      release_date: new Date('2026-12-18'),
    });

    const { data, total } = await listAllTitles.execute({
      releaseDateAfter: new Date('2026-08-20'),
    });

    expect(total).toBe(1);
    expect(data[0].title).toBe('Avengers: Doomsday');
  });
});
