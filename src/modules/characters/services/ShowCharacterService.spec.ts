import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import ShowCharacterService from './ShowCharacterService';
import AppError from '@shared/errors/AppError';

let fakeCharactersRepository: FakeCharactersRepository;
let showCharacter: ShowCharacterService;

describe('ShowCharacter', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    showCharacter = new ShowCharacterService(fakeCharactersRepository);
  });

  it('Should be able to show a character by ID', async () => {
    const createdCharacter = await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      description: 'Genius billionaire playboy philanthropist',
      continuity: 'MCU',
      multiverse_designation: 'Earth-199999',
    });

    const character = await showCharacter.execute({ character_id: createdCharacter.id });

    expect(character).toBeDefined();
    expect(character!.id).toBe(createdCharacter.id);
    expect(character!.name).toBe('Tony Stark');
    expect(character!.alias).toBe('Iron Man');
    expect(character!.continuity).toBe('MCU');
    expect(character!.multiverse_designation).toBe('Earth-199999');
  });

  it('Should return undefined when character is not found', async () => {
    const character = await showCharacter.execute({ character_id: 999 });
    expect(character).toBeUndefined();
  });

  it('Should be able to show a character with variant information', async () => {
    // Create base character
    const baseCharacter = await fakeCharactersRepository.create({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'MCU',
      multiverse_designation: 'Earth-199999',
    });

    // Create variant
    const variantCharacter = await fakeCharactersRepository.create({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'Sony Spider-Man Universe',
      multiverse_designation: 'Earth-96283',
      variant_of: baseCharacter.id,
    });

    const character = await showCharacter.execute({ character_id: variantCharacter.id });

    expect(character).toBeDefined();
    expect(character!.variant_of).toBe(baseCharacter.id);
    expect(character!.continuity).toBe('Sony Spider-Man Universe');
  });
}); 