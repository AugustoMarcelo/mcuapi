import ITVShow from '@modules/tvshows/entities/ITVShow';
import FakeTVShowsRepository from '@modules/tvshows/repositories/fakes/FakeTVShowsRepository';
import ListTVShowsService from '@modules/tvshows/services/ListTVShowsService';
import faker from 'faker';

const mockTVShow = (): ITVShow => ({
  id: faker.random.number(),
  title: faker.random.words(),
  overview: faker.random.words(),
  cover_url: faker.internet.url(),
  trailer_url: faker.internet.url(),
  number_episodes: faker.random.number(),
  season: faker.random.number(),
  directed_by: faker.name.findName(),
  phase: faker.random.number(),
  saga: faker.random.words(),
  chronology: faker.random.number(),
  release_date: faker.date.past(),
  last_aired_date: faker.date.future(),
  updated_at: faker.date.recent(),
});

describe('ListAllTVShowsService', () => {
  it('Should be able to list tv shows with limit params', async () => {
    const initialData = Array.from({ length: 5 }).map(() => mockTVShow());
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);
    const { data, total } = await listTVShows.execute({
      page: 1,
      limit: 3,
    });
    expect(total).toBe(5);
    expect(data).toEqual([initialData[0], initialData[1], initialData[2]]);
  });

  it('Should be able to list only tv shows attributes with columns params', async () => {
    const initialData = [mockTVShow()];
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);
    const { data, total } = await listTVShows.execute({
      columns: ['title', 'release_date', 'season'],
    });

    expect(total).toBe(1);
    expect(data[0]).not.toHaveProperty('overview');
    expect(data[0]).not.toHaveProperty('cover_url');
    expect(data[0]).not.toHaveProperty('trailer_url');
    expect(data[0]).not.toHaveProperty('directed_by');
    expect(data[0]).not.toHaveProperty('number_episodes');
    expect(data[0]).not.toHaveProperty('phase');
    expect(data[0]).not.toHaveProperty('saga');
    expect(data[0]).not.toHaveProperty('chronology');
    expect(data[0]).not.toHaveProperty('last_aired_date');
    expect(data[0]).not.toHaveProperty('updated_at');
  });

  it('Should be able to return filter data by filter param', async () => {
    const searchedTVShow = {
      ...mockTVShow(),
      title: 'any_title',
    };
    const initialData = [searchedTVShow, mockTVShow()];
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);

    const { data, total } = await listTVShows.execute({
      filter: [{ column: 'title', value: 'any_title' }],
    });

    expect(data[0]).toEqual(searchedTVShow);
    expect(total).toBe(1);
  });

  it('Should return updated_at field in tv show listings', async () => {
    const initialData = [mockTVShow()];
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);

    const { data } = await listTVShows.execute({});

    expect(data[0]).toHaveProperty('updated_at');
    expect(data[0].updated_at).toBeInstanceOf(Date);
  });

  it('Should be able to filter tv shows by multiple filter clauses', async () => {
    const wandavision = { ...mockTVShow(), title: 'WandaVision', phase: 4 };
    const lokiShow = { ...mockTVShow(), title: 'Loki', phase: 4 };
    const initialData = [wandavision, lokiShow];
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);

    const { data, total } = await listTVShows.execute({
      filter: [
        { column: 'phase', value: '4' },
        { column: 'title', value: 'Wanda' },
      ],
    });

    expect(total).toBe(1);
    expect(data[0]).toEqual(wandavision);
  });

  it('Should be able to order tv shows by multiple columns', async () => {
    const phaseFourA = { ...mockTVShow(), title: 'Loki', phase: 4 };
    const phaseFourB = { ...mockTVShow(), title: 'WandaVision', phase: 4 };
    const phaseOne = { ...mockTVShow(), title: 'Agent Carter', phase: 1 };
    const initialData = [phaseFourB, phaseOne, phaseFourA];
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);

    const { data } = await listTVShows.execute({
      order: [
        { column: 'phase', direction: 'DESC' },
        { column: 'title', direction: 'ASC' },
      ],
    });

    expect(data.map(tvshow => tvshow.title)).toEqual([
      'Loki',
      'WandaVision',
      'Agent Carter',
    ]);
  });
});
