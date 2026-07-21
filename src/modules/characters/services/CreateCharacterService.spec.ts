import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import CreateCharacterService from './CreateCharacterService';

let fakeCharactersRepository: FakeCharactersRepository;
let createCharacter: CreateCharacterService;

describe('CreateCharacter', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    createCharacter = new CreateCharacterService(fakeCharactersRepository);
  });

  it('Should be able to create a new character', async () => {
    const character = await createCharacter.execute({
      name: 'Tony Stark',
      alias: 'Iron Man',
      description: 'Genius billionaire playboy philanthropist',
      continuity: 'MCU',
      multiverse_designation: 'Earth-616',
    });

    expect(character).toHaveProperty('id');
    expect(character.name).toBe('Tony Stark');
    expect(character.alias).toBe('Iron Man');
    expect(character.continuity).toBe('MCU');
    expect(character.multiverse_designation).toBe('Earth-616');
  });

  it('Should be able to create a character variant', async () => {
    // Create base character first
    const baseCharacter = await createCharacter.execute({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'MCU',
      multiverse_designation: 'Earth-616',
    });

    // Create variant
    const variantCharacter = await createCharacter.execute({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'Sony Spider-Man Universe',
      multiverse_designation: 'Earth-96283',
      variant_of: baseCharacter.id,
    });

    expect(variantCharacter).toHaveProperty('id');
    expect(variantCharacter.name).toBe('Peter Parker');
    expect(variantCharacter.variant_of).toBe(baseCharacter.id);
    expect(variantCharacter.continuity).toBe('Sony Spider-Man Universe');
  });

  it('Should set default continuity to MCU when not provided', async () => {
    const character = await createCharacter.execute({
      name: 'Steve Rogers',
      alias: 'Captain America',
    });

    expect(character.continuity).toBe('MCU');
  });
}); 