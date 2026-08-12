import { container } from 'tsyringe';
import GetTimelineService from './GetTimelineService';
import ITVShow from '@modules/tvshows/entities/ITVShow';

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
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 1,
        type: 'movie',
      },
      {
        id: 2,
        title: 'The Avengers',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
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
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 25,
        type: 'tvshow',
      },
    ];

    mockMoviesRepository.findAll.mockResolvedValue({
      data: mockMovies,
      total: 3,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({
      data: mockTVShows,
      total: 1,
    });

    const result = await getTimelineService.execute();

    expect(result).toHaveLength(2);

    // Check MCU timeline
    const mcuTimeline = result.find(t => t.continuity === 'MCU');
    expect(mcuTimeline).toBeDefined();
    expect(mcuTimeline!.multiverse_designation).toBe('Earth-616');
    expect(mcuTimeline!.entries).toHaveLength(3);

    // Check Sony timeline
    const sonyTimeline = result.find(
      t => t.continuity === 'Sony Spider-Man Universe',
    );
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
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 1,
        type: 'movie',
      },
    ];

    const mockTVShows = [
      {
        id: 1,
        title: 'WandaVision',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 25,
        type: 'tvshow',
      },
    ];

    mockMoviesRepository.findAll.mockResolvedValue({
      data: mockMovies,
      total: 1,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({
      data: mockTVShows,
      total: 1,
    });

    const result = await getTimelineService.execute('Earth-616');

    expect(result).toHaveLength(1);
    expect(result[0].multiverse_designation).toBe('Earth-616');
    expect(result[0].entries).toHaveLength(2);
  });

  it('Should sort entries by chronology order', async () => {
    const mockMovies = [
      {
        id: 2,
        title: 'The Avengers',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 6,
        type: 'movie',
      },
      {
        id: 1,
        title: 'Iron Man',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 1,
        type: 'movie',
      },
    ];

    const mockTVShows: ITVShow[] = [];

    mockMoviesRepository.findAll.mockResolvedValue({
      data: mockMovies,
      total: 2,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({
      data: mockTVShows,
      total: 0,
    });

    const result = await getTimelineService.execute();

    expect(result[0].entries).toHaveLength(2);
    expect(result[0].entries[0].title).toBe('Iron Man');
    expect(result[0].entries[0].chronology_order).toBe(1);
    expect(result[0].entries[1].title).toBe('The Avengers');
    expect(result[0].entries[1].chronology_order).toBe(6);
  });

  it('Should sort entries by release_date when chronology_order is missing or zero', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Iron Man',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        release_date: new Date('2008-05-02'),
        type: 'movie',
      },
      {
        id: 2,
        title: 'The Avengers',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        release_date: new Date('2012-05-04'),
        type: 'movie',
      },
      {
        id: 3,
        title: 'Captain America: The First Avenger',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        release_date: new Date('2011-07-22'),
        type: 'movie',
      },
    ];

    mockMoviesRepository.findAll.mockResolvedValue({
      data: mockMovies,
      total: 3,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getTimelineService.execute();

    expect(result[0].entries.map(e => e.title)).toEqual([
      'Iron Man',
      'Captain America: The First Avenger',
      'The Avengers',
    ]);
  });

  it('Should place entries with a real chronology_order before date-ordered entries', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Iron Man',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        release_date: new Date('1943-01-01'),
        type: 'movie',
      },
      {
        id: 2,
        title: 'The Avengers',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 6,
        release_date: new Date('2012-05-04'),
        type: 'movie',
      },
    ];

    mockMoviesRepository.findAll.mockResolvedValue({
      data: mockMovies,
      total: 2,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getTimelineService.execute();

    // "The Avengers" has a real chronology_order, so it sorts first even
    // though "Iron Man" has an earlier release_date fallback.
    expect(result[0].entries.map(e => e.title)).toEqual([
      'The Avengers',
      'Iron Man',
    ]);
  });

  it('Should place entries without chronology_order and without release_date last, preserving their original order', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Movie With Release Date 1',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        release_date: new Date('2008-05-02'),
        type: 'movie',
      },
      {
        id: 2,
        title: 'Movie Without Chronology Or Date 1',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        type: 'movie',
      },
      {
        id: 3,
        title: 'Movie With Release Date 2',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        release_date: new Date('2012-05-04'),
        type: 'movie',
      },
      {
        id: 4,
        title: 'Movie Without Chronology Or Date 2',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        timeline_chronology_order: 0,
        type: 'movie',
      },
    ];

    mockMoviesRepository.findAll.mockResolvedValue({
      data: mockMovies,
      total: 4,
    });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getTimelineService.execute();

    // Date-ordered entries (bucket 2) sort first, by release_date. Entries
    // with neither a real chronology_order nor a release_date (bucket 3)
    // sort after them, retaining their original relative order (relying on
    // Array.prototype.sort's stability guarantee for the comparator's
    // `return 0` tie case) rather than being interleaved with, or placed
    // before, the date-ordered entries.
    expect(result[0].entries.map(e => e.title)).toEqual([
      'Movie With Release Date 1',
      'Movie With Release Date 2',
      'Movie Without Chronology Or Date 1',
      'Movie Without Chronology Or Date 2',
    ]);
  });

  it('Should handle empty results', async () => {
    mockMoviesRepository.findAll.mockResolvedValue({ data: [], total: 0 });
    mockTVShowsRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const result = await getTimelineService.execute();

    expect(result).toHaveLength(0);
  });
});
