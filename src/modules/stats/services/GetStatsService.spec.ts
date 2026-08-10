import { container } from 'tsyringe';
import GetStatsService from './GetStatsService';

const mockMoviesRepository = {
  getStats: jest.fn(),
};

const mockTVShowsRepository = {
  getStats: jest.fn(),
};

const mockCharactersRepository = {
  getStats: jest.fn(),
};

describe('GetStatsService', () => {
  let getStatsService: GetStatsService;

  beforeEach(() => {
    container.registerInstance('MoviesRepository', mockMoviesRepository);
    container.registerInstance('TVShowsRepository', mockTVShowsRepository);
    container.registerInstance(
      'CharactersRepository',
      mockCharactersRepository,
    );

    getStatsService = container.resolve(GetStatsService);
    jest.clearAllMocks();
  });

  it('Should return the count of each resource and the combined title count', async () => {
    mockMoviesRepository.getStats.mockResolvedValue({
      count: 74,
      continuities: ['MCU'],
      designations: ['Earth-616'],
      last_updated: new Date('2026-08-09T18:22:04.000Z'),
    });
    mockTVShowsRepository.getStats.mockResolvedValue({
      count: 56,
      continuities: ['MCU'],
      designations: ['Earth-616'],
      last_updated: new Date('2026-08-01T00:00:00.000Z'),
    });
    mockCharactersRepository.getStats.mockResolvedValue({
      count: 302,
      designations: ['Earth-616'],
      last_updated: new Date('2026-08-05T00:00:00.000Z'),
    });

    const result = await getStatsService.execute();

    expect(result.movies).toBe(74);
    expect(result.tvshows).toBe(56);
    expect(result.characters).toBe(302);
    expect(result.titles).toBe(130);
  });

  it('Should count continuities as the distinct union of movies and tvshows only', async () => {
    mockMoviesRepository.getStats.mockResolvedValue({
      count: 74,
      continuities: ['MCU', 'X-Men Universe'],
      designations: ['Earth-616'],
      last_updated: null,
    });
    mockTVShowsRepository.getStats.mockResolvedValue({
      count: 56,
      continuities: ['MCU', 'Agent Carter'],
      designations: ['Earth-616'],
      last_updated: null,
    });
    mockCharactersRepository.getStats.mockResolvedValue({
      count: 302,
      designations: ['Earth-616'],
      last_updated: null,
    });

    const result = await getStatsService.execute();

    // MCU deduped across movies+tvshows -> {MCU, X-Men Universe, Agent Carter} = 3
    expect(result.continuities).toBe(3);
  });

  it('Should count designations as the distinct union of movies, tvshows and characters', async () => {
    mockMoviesRepository.getStats.mockResolvedValue({
      count: 74,
      continuities: ['MCU'],
      designations: ['Earth-616', 'Earth-828'],
      last_updated: null,
    });
    mockTVShowsRepository.getStats.mockResolvedValue({
      count: 56,
      continuities: ['MCU'],
      designations: ['Earth-616'],
      last_updated: null,
    });
    mockCharactersRepository.getStats.mockResolvedValue({
      count: 302,
      // Earth-838 only exists on characters (the DS2 Illuminati) — titles
      // alone would only ever produce 4, so this pins the 3-table union.
      designations: ['Earth-616', 'Earth-838'],
      last_updated: null,
    });

    const result = await getStatsService.execute();

    expect(result.designations).toBe(3);
  });

  it('Should use the max updated_at across the three tables as last_updated', async () => {
    mockMoviesRepository.getStats.mockResolvedValue({
      count: 1,
      continuities: [],
      designations: [],
      last_updated: new Date('2026-08-01T00:00:00.000Z'),
    });
    mockTVShowsRepository.getStats.mockResolvedValue({
      count: 1,
      continuities: [],
      designations: [],
      last_updated: new Date('2026-08-09T18:22:04.000Z'),
    });
    mockCharactersRepository.getStats.mockResolvedValue({
      count: 1,
      designations: [],
      last_updated: new Date('2026-08-05T00:00:00.000Z'),
    });

    const result = await getStatsService.execute();

    expect(result.last_updated).toEqual(new Date('2026-08-09T18:22:04.000Z'));
  });

  it('Should return a null last_updated when all three tables are empty', async () => {
    mockMoviesRepository.getStats.mockResolvedValue({
      count: 0,
      continuities: [],
      designations: [],
      last_updated: null,
    });
    mockTVShowsRepository.getStats.mockResolvedValue({
      count: 0,
      continuities: [],
      designations: [],
      last_updated: null,
    });
    mockCharactersRepository.getStats.mockResolvedValue({
      count: 0,
      designations: [],
      last_updated: null,
    });

    const result = await getStatsService.execute();

    expect(result.last_updated).toBeNull();
    expect(result.titles).toBe(0);
    expect(result.continuities).toBe(0);
    expect(result.designations).toBe(0);
  });
});
