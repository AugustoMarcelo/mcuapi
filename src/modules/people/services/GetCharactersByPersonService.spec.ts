import FakePeopleRepository from '../repositories/fakes/FakePeopleRepository';
import GetCharactersByPersonService from './GetCharactersByPersonService';
import AppError from '@shared/errors/AppError';
import ICharacter from '@modules/characters/entities/ICharacter';

let fakePeopleRepository: FakePeopleRepository;
let getCharactersByPerson: GetCharactersByPersonService;

const youngXavier: ICharacter = {
  id: 1,
  name: 'Charles Xavier',
  continuity: 'FOX X-Men Universe',
};
const oldXavier: ICharacter = {
  id: 2,
  name: 'Charles Xavier',
  continuity: 'FOX X-Men Universe',
};

describe('GetCharactersByPerson', () => {
  beforeEach(() => {
    fakePeopleRepository = new FakePeopleRepository();
    getCharactersByPerson = new GetCharactersByPersonService(
      fakePeopleRepository,
    );
  });

  it('Should return characters in in-story recast order regardless of insertion order', async () => {
    const person = fakePeopleRepository.seedPerson({ name: 'Patrick Stewart' });

    fakePeopleRepository.seedCharacterLink({
      person_id: person.id,
      character: oldXavier,
      recast_order: 2,
    });
    fakePeopleRepository.seedCharacterLink({
      person_id: person.id,
      character: youngXavier,
      recast_order: 1,
    });

    const result = await getCharactersByPerson.execute(person.id);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].recast_order).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[1].recast_order).toBe(2);
  });

  it('Should return empty array when the person has played no characters', async () => {
    const person = fakePeopleRepository.seedPerson({ name: 'Kevin Feige' });

    const result = await getCharactersByPerson.execute(person.id);

    expect(result).toHaveLength(0);
  });

  it('Should throw a 404 error when the person does not exist', async () => {
    await expect(getCharactersByPerson.execute(999)).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(getCharactersByPerson.execute(999)).rejects.toHaveProperty(
      'statusCode',
      404,
    );
  });
});
