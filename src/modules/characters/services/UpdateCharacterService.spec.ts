import AppError from '@shared/errors/AppError';
import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import UpdateCharacterService from './UpdateCharacterService';

let fakeCharactersRepository: FakeCharactersRepository;
let updateCharacter: UpdateCharacterService;

describe('UpdateCharacter', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    updateCharacter = new UpdateCharacterService(fakeCharactersRepository);
  });

  it('Should be able to update a character', async () => {
    const character = await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      continuity: 'MCU',
      multiverse_designation: 'Earth-616',
    });

    const updated = await updateCharacter.execute({
      character_id: character.id,
      alias: 'Iron Man / Tony Stark',
      description: 'Genius billionaire playboy philanthropist',
    });

    expect(updated.alias).toBe('Iron Man / Tony Stark');
    expect(updated.description).toBe('Genius billionaire playboy philanthropist');
    expect(updated.name).toBe('Tony Stark');
    expect(updated.continuity).toBe('MCU');
  });

  it('Should throw AppError when updating a non-existing character', async () => {
    await expect(
      updateCharacter.execute({
        character_id: 9999,
        alias: 'Does not exist',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
