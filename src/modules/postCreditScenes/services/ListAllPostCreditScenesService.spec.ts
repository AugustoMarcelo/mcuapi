import FakePostCreditScenesRepository from '../repositories/fakes/FakePostCreditScenesRepository';
import ListAllPostCreditScenesService from './ListAllPostCreditScenesService';

let fakePostCreditScenesRepository: FakePostCreditScenesRepository;
let listAllPostCreditScenes: ListAllPostCreditScenesService;

describe('ListAllPostCreditScenes', () => {
  beforeEach(() => {
    fakePostCreditScenesRepository = new FakePostCreditScenesRepository();
    listAllPostCreditScenes = new ListAllPostCreditScenesService(
      fakePostCreditScenesRepository,
    );
  });

  it('Should be able to list all post-credit scenes', async () => {
    fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Nick Fury reveals the Avengers Initiative.',
      is_stinger: false,
    });
    fakePostCreditScenesRepository.seed({
      movie_id: 2,
      description:
        'Thanos smiles, planning to collect the Infinity Stones himself.',
      is_stinger: false,
    });

    const result = await listAllPostCreditScenes.execute({
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('Should be able to filter post-credit scenes by movie_id', async () => {
    fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Nick Fury reveals the Avengers Initiative.',
      is_stinger: false,
    });
    fakePostCreditScenesRepository.seed({
      movie_id: 2,
      description: 'Thanos smiles.',
      is_stinger: false,
    });

    const result = await listAllPostCreditScenes.execute({
      page: 1,
      limit: 10,
      filter: [{ column: 'movie_id', value: '1' }],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].movie_id).toBe(1);
  });

  it('Should be able to filter post-credit scenes by is_stinger', async () => {
    fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Mid-credits scene.',
      is_stinger: true,
    });
    fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Post-credits scene.',
      is_stinger: false,
    });

    const result = await listAllPostCreditScenes.execute({
      page: 1,
      limit: 10,
      filter: [{ column: 'is_stinger', value: 'true' }],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].is_stinger).toBe(true);
  });

  it('Should be able to paginate results', async () => {
    Array.from({ length: 5 }, (_, index) =>
      fakePostCreditScenesRepository.seed({
        movie_id: index + 1,
        description: `Scene ${index + 1}`,
        is_stinger: false,
      }),
    );

    const result = await listAllPostCreditScenes.execute({ page: 1, limit: 3 });

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
  });

  it('Should project only the requested columns', async () => {
    fakePostCreditScenesRepository.seed({
      movie_id: 1,
      description: 'Nick Fury reveals the Avengers Initiative.',
      is_stinger: false,
    });

    const result = await listAllPostCreditScenes.execute({
      page: 1,
      limit: 10,
      columns: ['description'],
    });

    expect(result.data[0].description).toBe(
      'Nick Fury reveals the Avengers Initiative.',
    );
    expect(result.data[0].id).toBeUndefined();
    expect(result.data[0].movie_id).toBeUndefined();
  });
});
