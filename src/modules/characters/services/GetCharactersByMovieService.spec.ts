import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import GetCharactersByMovieService from './GetCharactersByMovieService';

let fakeCharactersRepository: FakeCharactersRepository;
let getCharactersByMovie: GetCharactersByMovieService;

describe('GetCharactersByMovie', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    getCharactersByMovie = new GetCharactersByMovieService(fakeCharactersRepository);
  });

  it('Should be able to get characters by movie ID', async () => {
    // Create test characters
    const character1 = await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      continuity: 'MCU',
      first_appearance_movie_id: 1,
    });

    const character2 = await fakeCharactersRepository.create({
      name: 'Pepper Potts',
      alias: undefined,
      continuity: 'MCU',
      first_appearance_movie_id: 1,
    });

    const character3 = await fakeCharactersRepository.create({
      name: 'Steve Rogers',
      alias: 'Captain America',
      continuity: 'MCU',
      first_appearance_movie_id: 5, // Different movie
    });

    const result = await getCharactersByMovie.execute(1);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Tony Stark');
    expect(result[1].name).toBe('Pepper Potts');
  });

  it('Should return empty array when no characters found for movie', async () => {
    const result = await getCharactersByMovie.execute(999);

    expect(result).toHaveLength(0);
  });

  it('Should include character variants in results', async () => {
    // Create base character
    const baseCharacter = await fakeCharactersRepository.create({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'MCU',
      first_appearance_movie_id: 1,
    });

    // Create variant
    const variantCharacter = await fakeCharactersRepository.create({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'Sony Spider-Man Universe',
      first_appearance_movie_id: 1,
      variant_of: baseCharacter.id,
    });

    const result = await getCharactersByMovie.execute(1);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Peter Parker');
    expect(result[1].name).toBe('Peter Parker');
    expect(result[1].variant_of).toBe(baseCharacter.id);
  });
}); 
