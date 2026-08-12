import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import GetMoviesByCharacterService from './GetMoviesByCharacterService';
import AppError from '@shared/errors/AppError';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';

let fakeCharactersRepository: FakeCharactersRepository;
let getMoviesByCharacter: GetMoviesByCharacterService;

const movie = {
  id: 1,
  title: 'Iron Man',
  directed_by: 'Jon Favreau',
  post_credit_scenes: 1,
} as IMovie;
const tvshow = {
  id: 1,
  title: 'Loki',
  season: 1,
  number_episodes: 6,
} as ITVShow;

describe('GetMoviesByCharacter', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    getMoviesByCharacter = new GetMoviesByCharacterService(
      fakeCharactersRepository,
    );
  });

  it('Should be able to get movies a character appears in, with role_type', async () => {
    const character = await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      continuity: 'MCU',
    });

    fakeCharactersRepository.seedAppearance({
      character_id: character.id,
      movie,
      role_type: 'main',
    });

    const result = await getMoviesByCharacter.execute(character.id);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Iron Man');
    expect(result[0].role_type).toBe('main');
  });

  it('Should not include tvshow appearances', async () => {
    const character = await fakeCharactersRepository.create({
      name: 'Loki',
      continuity: 'MCU',
    });

    fakeCharactersRepository.seedAppearance({
      character_id: character.id,
      tvshow,
      role_type: 'main',
    });

    const result = await getMoviesByCharacter.execute(character.id);

    expect(result).toHaveLength(0);
  });

  it('Should return empty array when the character has no movie appearances', async () => {
    const character = await fakeCharactersRepository.create({
      name: 'Pepper Potts',
      continuity: 'MCU',
    });

    const result = await getMoviesByCharacter.execute(character.id);

    expect(result).toHaveLength(0);
  });

  it('Should throw a 404 error when the character does not exist', async () => {
    await expect(getMoviesByCharacter.execute(999)).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(getMoviesByCharacter.execute(999)).rejects.toHaveProperty(
      'statusCode',
      404,
    );
  });
});
