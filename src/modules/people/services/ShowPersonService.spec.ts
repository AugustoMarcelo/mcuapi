import FakePeopleRepository from '../repositories/fakes/FakePeopleRepository';
import ShowPersonService from './ShowPersonService';
import AppError from '@shared/errors/AppError';

let fakePeopleRepository: FakePeopleRepository;
let showPerson: ShowPersonService;

describe('ShowPerson', () => {
  beforeEach(() => {
    fakePeopleRepository = new FakePeopleRepository();
    showPerson = new ShowPersonService(fakePeopleRepository);
  });

  it('Should be able to show a person by ID', async () => {
    const person = fakePeopleRepository.seedPerson({
      name: 'Robert Downey Jr.',
    });

    const result = await showPerson.execute({ person_id: person.id });

    expect(result).toBeDefined();
    expect(result.id).toBe(person.id);
    expect(result.name).toBe('Robert Downey Jr.');
  });

  it('Should throw AppError when person is not found', async () => {
    await expect(showPerson.execute({ person_id: 999 })).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(showPerson.execute({ person_id: 999 })).rejects.toHaveProperty(
      'statusCode',
      404,
    );
  });
});
