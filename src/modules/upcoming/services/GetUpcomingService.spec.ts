import { container } from 'tsyringe';
import GetUpcomingService from './GetUpcomingService';

const mockMoviesRepository = {
  findAll: jest.fn(),
};

const mockTVShowsRepository = {
  findAll: jest.fn(),
};

describe('GetUpcomingService', () => {
  let getUpcomingService: GetUpcomingService;

  beforeEach(() => {
    container.registerInstance('MoviesRepository', mockMoviesRepository);
    container.registerInstance('TVShowsRepository', mockTVShowsRepository);

    getUpcomingService = container.resolve(GetUpcomingService);
    jest.clearAllMocks();
    // Jest 26 predates useFakeTimers().setSystemTime() (added in Jest 27) —
    // pinning Date.now() achieves the same "today" determinism.
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-08-10T12:00:00.000Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should exclude titles whose release_date is in the past', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Iron Man',
          release_date: new Date('2008-05-02'),
          type: 'movie',
        },
        {
          id: 2,
          title: 'Avengers: Doomsday',
          release_date: new Date('2026-12-18'),
          type: 'movie',
        },
      ],
      total: 2,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getUpcomingService.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Avengers: Doomsday');
  });

  it('Should exclude titles with a NULL release_date', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        { id: 1, title: 'Blade', release_date: undefined, type: 'movie' },
        {
          id: 2,
          title: 'Avengers: Doomsday',
          release_date: new Date('2026-12-18'),
          type: 'movie',
        },
      ],
      total: 2,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getUpcomingService.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Avengers: Doomsday');
  });

  it('Should merge movies and tvshows into one list sorted by release_date ascending, each carrying its type', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Avengers: Doomsday',
          release_date: new Date('2026-12-18'),
          type: 'movie',
        },
      ],
      total: 1,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 53,
          title: 'VisionQuest',
          release_date: new Date('2026-10-14'),
          type: 'tvshow',
        },
      ],
      total: 1,
    });

    const result = await getUpcomingService.execute({ page: 1, limit: 10 });

    expect(result.data.map(item => item.title)).toEqual([
      'VisionQuest',
      'Avengers: Doomsday',
    ]);
    expect(result.data[0].type).toBe('tvshow');
    expect(result.data[1].type).toBe('movie');
  });

  it('Should filter by type', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Avengers: Doomsday',
          release_date: new Date('2026-12-18'),
          type: 'movie',
        },
      ],
      total: 1,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 53,
          title: 'VisionQuest',
          release_date: new Date('2026-10-14'),
          type: 'tvshow',
        },
      ],
      total: 1,
    });

    const result = await getUpcomingService.execute({
      page: 1,
      limit: 10,
      type: 'tvshow',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('VisionQuest');
  });

  it('Should filter by continuity', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Avengers: Doomsday',
          release_date: new Date('2026-12-18'),
          type: 'movie',
          continuity: 'MCU',
        },
        {
          id: 2,
          title: 'Ghost Rider',
          release_date: new Date('2027-01-01'),
          type: 'movie',
          continuity: 'Ghost Rider',
        },
      ],
      total: 2,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getUpcomingService.execute({
      page: 1,
      limit: 10,
      continuity: 'MCU',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Avengers: Doomsday');
  });

  it('Should filter by multiverse_designation', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Avengers: Doomsday',
          release_date: new Date('2026-12-18'),
          type: 'movie',
          multiverse_designation: 'Earth-616',
        },
        {
          id: 2,
          title: 'Some FOX title',
          release_date: new Date('2027-01-01'),
          type: 'movie',
          multiverse_designation: 'Earth-10005',
        },
      ],
      total: 2,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getUpcomingService.execute({
      page: 1,
      limit: 10,
      multiverse_designation: 'Earth-10005',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Some FOX title');
  });

  it('Should filter by is_mcu', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Avengers: Doomsday',
          release_date: new Date('2026-12-18'),
          type: 'movie',
          is_mcu: true,
        },
        {
          id: 2,
          title: 'Ghost Rider',
          release_date: new Date('2027-01-01'),
          type: 'movie',
          is_mcu: false,
        },
      ],
      total: 2,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getUpcomingService.execute({
      page: 1,
      limit: 10,
      is_mcu: false,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Ghost Rider');
  });

  it('Should return exactly one item for limit=1, with total reflecting the full filtered set', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'A',
          release_date: new Date('2026-09-01'),
          type: 'movie',
        },
        {
          id: 2,
          title: 'B',
          release_date: new Date('2026-10-01'),
          type: 'movie',
        },
        {
          id: 3,
          title: 'C',
          release_date: new Date('2026-11-01'),
          type: 'movie',
        },
      ],
      total: 3,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getUpcomingService.execute({ page: 1, limit: 1 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('A');
    expect(result.total).toBe(3);
  });

  it('Should return an empty result when nothing is upcoming', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({ data: [], total: 0 });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getUpcomingService.execute({ page: 1, limit: 10 });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
});
