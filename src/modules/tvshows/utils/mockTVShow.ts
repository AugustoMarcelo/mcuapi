import ITVShow from '@modules/tvshows/entities/ITVShow';

const mockTVShow = (): ITVShow => ({
  id: 1,
  title: 'Mock TV Show',
  overview: 'A mock tv show overview',
  cover_url: 'https://example.com/cover.jpg',
  trailer_url: 'https://example.com/trailer.mp4',
  number_episodes: 6,
  season: 1,
  directed_by: 'Mock Director',
  phase: 1,
  saga: 'Mock Saga',
  chronology: 1,
  release_date: new Date('2021-01-01'),
  last_aired_date: new Date('2021-02-05'),
  imdb_id: 'tt1234567',
  updated_at: new Date('2021-02-06'),
});

export default mockTVShow;
