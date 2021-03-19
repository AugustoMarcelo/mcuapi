import faker from 'faker';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import FakeTVShowsRepository from '@modules/tvshows/repositories/fakes/FakeTVShowsRepository';
import ListTVShowsService from '@modules/tvshows/services/ListTVShowsService';

const mockTVShow = (): ITVShow => ({
  id: faker.random.number(),
  title: faker.random.words(),
  overview: faker.random.words(),
  cover_url: faker.internet.url(),
  trailer_url: faker.internet.url(),
  number_episodes: faker.random.number(),
  number_seasons: faker.random.number(),
  directed_by: faker.name.findName(),
  phase: faker.random.number(),
  saga: faker.random.words(),
  release_date: faker.date.past(),
  last_aired_date: faker.date.future(),
});

describe.only('ListAllTVShowsService', () => {
  it('Should be able to list tv shows with limit params', async () => {
    const initialData = Array.from({ length: 5 }).map(() => mockTVShow());
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);
    const { data, total } = await listTVShows.execute({
      page: 1,
      limit: 3,
    });
    expect(total).toBe(3);
    expect(data).toEqual([initialData[0], initialData[1], initialData[2]]);
  });

  it('Should be able to list only tv shows attributes with columns params', async () => {
    const initialData = [mockTVShow()];
    const fakeTVShowsRepository = new FakeTVShowsRepository(initialData);
    const listTVShows = new ListTVShowsService(fakeTVShowsRepository);
    const { data, total } = await listTVShows.execute({
      columns: 'title,release_date,number_seasons',
    });

    expect(total).toBe(1);
    expect(data[0]).not.toHaveProperty('overview');
    expect(data[0]).not.toHaveProperty('cover_url');
    expect(data[0]).not.toHaveProperty('trailer_url');
    expect(data[0]).not.toHaveProperty('directed_by');
    expect(data[0]).not.toHaveProperty('number_episodes');
    expect(data[0]).not.toHaveProperty('phase');
    expect(data[0]).not.toHaveProperty('saga');
    expect(data[0]).not.toHaveProperty('last_aired_date');
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
      filter: 'title=any_title',
    });

    expect(data[0]).toEqual(searchedTVShow);
    expect(total).toBe(1);
  });
});
