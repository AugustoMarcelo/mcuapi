import ITVShow from '@modules/tvshows/entities/ITVShow';
import faker from 'faker';

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
  imdb_id: `tt${faker.random.number()}`,
});

export default mockTVShow;
