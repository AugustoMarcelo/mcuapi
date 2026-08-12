import FakePeopleRepository from '../repositories/fakes/FakePeopleRepository';
import ListAllPeopleService from './ListAllPeopleService';

let fakePeopleRepository: FakePeopleRepository;
let listAllPeople: ListAllPeopleService;

describe('ListAllPeople', () => {
  beforeEach(() => {
    fakePeopleRepository = new FakePeopleRepository();
    listAllPeople = new ListAllPeopleService(fakePeopleRepository);
  });

  it('Should be able to list all people', async () => {
    fakePeopleRepository.seedPerson({ name: 'Robert Downey Jr.' });
    fakePeopleRepository.seedPerson({ name: 'Chris Evans' });

    const result = await listAllPeople.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('Should be able to filter people by name', async () => {
    fakePeopleRepository.seedPerson({ name: 'Robert Downey Jr.' });
    fakePeopleRepository.seedPerson({ name: 'Chris Evans' });

    const result = await listAllPeople.execute({
      page: 1,
      limit: 10,
      filter: [{ column: 'name', value: 'Robert' }],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Robert Downey Jr.');
  });

  it('Should be able to paginate results', async () => {
    Array.from({ length: 5 }, (_, index) =>
      fakePeopleRepository.seedPerson({ name: `Person ${index + 1}` }),
    );

    const result = await listAllPeople.execute({ page: 1, limit: 3 });

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
  });

  it('Should be able to order people by name', async () => {
    fakePeopleRepository.seedPerson({ name: 'Chris Evans' });
    fakePeopleRepository.seedPerson({ name: 'Robert Downey Jr.' });

    const result = await listAllPeople.execute({
      page: 1,
      limit: 10,
      order: [{ column: 'name', direction: 'ASC' }],
    });

    expect(result.data.map(person => person.name)).toEqual([
      'Chris Evans',
      'Robert Downey Jr.',
    ]);
  });

  it('Should project only the requested columns', async () => {
    fakePeopleRepository.seedPerson({ name: 'Robert Downey Jr.' });

    const result = await listAllPeople.execute({
      page: 1,
      limit: 10,
      columns: ['name'],
    });

    expect(result.data[0].name).toBe('Robert Downey Jr.');
    expect(result.data[0].id).toBeUndefined();
    expect(result.data[0].created_at).toBeUndefined();
  });
});
