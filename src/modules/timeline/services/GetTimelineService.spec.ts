import { container } from 'tsyringe';
import GetTimelineService from './GetTimelineService';

// Mock repositories
const mockMoviesRepository = {
  findAll: jest.fn(),
};

const mockTVShowsRepository = {
  findAll: jest.fn(),
};

describe('GetTimelineService', () => {
  let getTimelineService: GetTimelineService;

  beforeEach(() => {
    // Register mocks
    container.registerInstance('MoviesRepository', mockMoviesRepository);
    container.registerInstance('TVShowsRepository', mockTVShowsRepository);
    
    getTimelineService = container.resolve(GetTimelineService);
    jest.clearAllMocks();
  });

  it('Should return timeline grouped by continuity and multiverse', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Iron Man',
        continuity: 'MCU',
        multiverse_designation: 'Earth-199999',
        timeline_chronology_order: 1,
        type: 'movie',
      },
      {
        id: 2,
        title: 'The Avengers',
        continuity: 'MCU',
        multiverse_designation: 'Earth-199999',
        timeline_chronology_order: 6,
        type: 'movie',
      },
      {
        id: 3,
        title: 'Spider-Man',
        continuity: 'Sony Spider-Man Universe',
        multiverse_designation: 'Earth-96283',
        timeline_chronology_order: 1,
        type: 'movie',
      },
    ];

    const mockTVShows = [
      {
        id: 1,
        title: 'WandaVision',
        continuity: 'MCU',
        multiverse_designation: 'Earth-199999',
        timeline_chronology_order: 25,
        type: 'tvshow',
      },
    ];

    mockMoviesRepository.findAll.mockResolvedValue({ data: mockMovies, total: 3 });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: mockTVShows, total: 1 });

    const result = await getTimelineService.execute();

    expect(result).toHaveLength(2);
    
    // Check MCU timeline
    const mcuTimeline = result.find(t => t.continuity === 'MCU');
    expect(mcuTimeline).toBeDefined();
    expect(mcuTimeline!.multiverse_designation).toBe('Earth-199999');
    expect(mcuTimeline!.entries).toHaveLength(3);
    
    // Check Sony timeline
    const sonyTimeline = result.find(t => t.continuity === 'Sony Spider-Man Universe');
    expect(sonyTimeline).toBeDefined();
    expect(sonyTimeline!.multiverse_designation).toBe('Earth-96283');
    expect(sonyTimeline!.entries).toHaveLength(1);
  });

  it('Should filter by specific multiverse designation', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Iron Man',
        continuity: 'MCU',
        multiverse_designation: 'Earth-199999',
        timeline_chronology_order: 1,
        type: 'movie',
      },
    ];

    const mockTVShows = [
      {
        id: 1,
        title: 'WandaVision',
        continuity: 'MCU',
        multiverse_designation: 'Earth-199999',
        timeline_chronology_order: 25,
        type: 'tvshow',
      },
    ];

    mockMoviesRepository.findAll.mockResolvedValue({ data: mockMovies, total: 1 });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: mockTVShows, total: 1 });

    const result = await getTimelineService.execute('Earth-199999');

    expect(result).toHaveLength(1);
    expect(result[0].multiverse_designation).toBe('Earth-199999');
    expect(result[0].entries).toHaveLength(2);
  });

  it('Should sort entries by chronology order', async () => {
    const mockMovies = [
      {
        id: 2,
        title: 'The Avengers',
        continuity: 'MCU',
        multiverse_designation: 'Earth-199999',
        timeline_chronology_order: 6,
        type: 'movie',
      },
      {
        id: 1,
        title: 'Iron Man',
        continuity: 'MCU',
        multiverse_designation: 'Earth-199999',
        timeline_chronology_order: 1,
        type: 'movie',
      },
    ];

    const mockTVShows: any[] = [];

    mockMoviesRepository.findAll.mockResolvedValue({ data: mockMovies, total: 2 });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: mockTVShows, total: 0 });

    const result = await getTimelineService.execute();

    expect(result[0].entries).toHaveLength(2);
    expect(result[0].entries[0].title).toBe('Iron Man');
    expect(result[0].entries[0].chronology_order).toBe(1);
    expect(result[0].entries[1].title).toBe('The Avengers');
    expect(result[0].entries[1].chronology_order).toBe(6);
  });

  it('Should handle empty results', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({ data: [], total: 0 });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getTimelineService.execute();

    expect(result).toHaveLength(0);
  });
}); 