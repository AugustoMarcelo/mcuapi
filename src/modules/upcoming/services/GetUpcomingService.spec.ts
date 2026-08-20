import { container } from 'tsyringe';
import GetUpcomingService from './GetUpcomingService';

const mockTitlesRepository = {
  findAll: jest.fn(),
};

describe('GetUpcomingService', () => {
  let getUpcomingService: GetUpcomingService;

  beforeEach(() => {
    container.registerInstance('TitlesRepository', mockTitlesRepository);

    getUpcomingService = container.resolve(GetUpcomingService);
    jest.clearAllMocks();
  });

  it('Should delegate to TitlesRepository with a release_date > today predicate', async () => {
    mockTitlesRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    const before = Date.now();
    await getUpcomingService.execute({ page: 1, limit: 10 });
    const after = Date.now();

    expect(mockTitlesRepository.findAll).toHaveBeenCalledTimes(1);

    const [call] = mockTitlesRepository.findAll.mock.calls[0];
    expect(call.releaseDateAfter).toBeInstanceOf(Date);
    expect(call.releaseDateAfter.getTime()).toBeGreaterThanOrEqual(before);
    expect(call.releaseDateAfter.getTime()).toBeLessThanOrEqual(after);
  });

  it('Should forward pagination and filters to TitlesRepository', async () => {
    mockTitlesRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    await getUpcomingService.execute({
      page: 2,
      limit: 5,
      type: 'tvshow',
      continuity: 'MCU',
      multiverse_designation: 'Earth-616',
      is_mcu: true,
    });

    expect(mockTitlesRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 5,
        type: 'tvshow',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        is_mcu: true,
      }),
    );
  });

  it('Should return the data and total from TitlesRepository unchanged', async () => {
    const data = [
      {
        id: 1,
        type: 'movie' as const,
        title: 'Avengers: Doomsday',
        release_date: new Date('2026-12-18'),
      },
    ];
    mockTitlesRepository.findAll.mockResolvedValue({ data, total: 1 });

    const result = await getUpcomingService.execute({ page: 1, limit: 10 });

    expect(result.data).toBe(data);
    expect(result.total).toBe(1);
  });
});
