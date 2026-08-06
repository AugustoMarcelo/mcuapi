import AppError from '@shared/errors/AppError';
import FakeStreamingRepository from '../repositories/fakes/FakeStreamingRepository';
import GetStreamingByTitleService from './GetStreamingByTitleService';

let fakeRepository: FakeStreamingRepository;
let getStreaming: GetStreamingByTitleService;

describe('GetStreamingByTitleService', () => {
  beforeEach(() => {
    fakeRepository = new FakeStreamingRepository();
    getStreaming = new GetStreamingByTitleService(fakeRepository);
  });

  it('Should return every region when none is given', async () => {
    fakeRepository.seed({ movie_id: 1, region: 'US' });
    fakeRepository.seed({ movie_id: 1, region: 'BR' });

    const rows = await getStreaming.execute({ title_id: 1, type: 'movie' });

    expect(rows).toHaveLength(2);
    expect(rows.map(row => row.region)).toEqual(['BR', 'US']);
  });

  it('Should narrow to a single region', async () => {
    fakeRepository.seed({ movie_id: 1, region: 'US' });
    fakeRepository.seed({ movie_id: 1, region: 'BR' });

    const rows = await getStreaming.execute({
      title_id: 1,
      type: 'movie',
      region: 'BR',
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].region).toBe('BR');
  });

  it('Should accept a lowercase region', async () => {
    fakeRepository.seed({ movie_id: 1, region: 'US' });

    const rows = await getStreaming.execute({
      title_id: 1,
      type: 'movie',
      region: 'us',
    });

    expect(rows).toHaveLength(1);
  });

  it('Should not leak rows between movies and TV shows sharing an id', async () => {
    fakeRepository.seed({ movie_id: 1, provider: 'Disney+' });
    fakeRepository.seed({ tvshow_id: 1, provider: 'Netflix' });

    const movies = await getStreaming.execute({ title_id: 1, type: 'movie' });
    const shows = await getStreaming.execute({ title_id: 1, type: 'tvshow' });

    expect(movies).toHaveLength(1);
    expect(movies[0].provider).toBe('Disney+');
    expect(shows).toHaveLength(1);
    expect(shows[0].provider).toBe('Netflix');
  });

  it('Should return an empty list for a title with no known availability', async () => {
    await expect(
      getStreaming.execute({ title_id: 999, type: 'movie' }),
    ).resolves.toEqual([]);
  });

  it('Should reject a region that is not two letters', async () => {
    await expect(
      getStreaming.execute({ title_id: 1, type: 'movie', region: 'USA' }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      getStreaming.execute({ title_id: 1, type: 'movie', region: '1' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('Should treat an empty region as "all regions" rather than an error', async () => {
    fakeRepository.seed({ movie_id: 1, region: 'US' });

    await expect(
      getStreaming.execute({ title_id: 1, type: 'movie', region: '' }),
    ).resolves.toHaveLength(1);
  });

  it('Should reject a non-numeric or negative id', async () => {
    await expect(
      getStreaming.execute({ title_id: Number('abc'), type: 'movie' }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      getStreaming.execute({ title_id: -1, type: 'movie' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('Should order by region, then provider', async () => {
    fakeRepository.seed({ movie_id: 1, region: 'US', provider: 'Disney+' });
    fakeRepository.seed({ movie_id: 1, region: 'US', provider: 'Apple TV' });
    fakeRepository.seed({ movie_id: 1, region: 'BR', provider: 'Disney+' });

    const rows = await getStreaming.execute({ title_id: 1, type: 'movie' });

    expect(rows.map(row => `${row.region}/${row.provider}`)).toEqual([
      'BR/Disney+',
      'US/Apple TV',
      'US/Disney+',
    ]);
  });

  it('Should allow several providers for one title in one region', async () => {
    fakeRepository.seed({ movie_id: 1, region: 'US', provider: 'Disney+' });
    fakeRepository.seed({ movie_id: 1, region: 'US', provider: 'Apple TV' });

    const rows = await getStreaming.execute({
      title_id: 1,
      type: 'movie',
      region: 'US',
    });

    expect(rows.map(row => row.provider)).toEqual(['Apple TV', 'Disney+']);
  });
});
