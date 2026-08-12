import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import GetTVShowsByCharacterService from './GetTVShowsByCharacterService';
import AppError from '@shared/errors/AppError';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';

let fakeCharactersRepository: FakeCharactersRepository;
let getTVShowsByCharacter: GetTVShowsByCharacterService;

const movie = {
  id: 1,
  title: 'Thor: Ragnarok',
  directed_by: 'Taika Waititi',
  post_credit_scenes: 2,
} as IMovie;
const tvshow = {
  id: 1,
  title: 'Loki',
  season: 1,
  number_episodes: 6,
} as ITVShow;

describe('GetTVShowsByCharacter', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    getTVShowsByCharacter = new GetTVShowsByCharacterService(
      fakeCharactersRepository,
    );
  });

  it('Should be able to get tv shows a character appears in, with role_type', async () => {
    const character = await fakeCharactersRepository.create({
      name: 'Loki',
      continuity: 'MCU',
    });

    fakeCharactersRepository.seedAppearance({
      character_id: character.id,
      tvshow,
      role_type: 'main',
    });

    const result = await getTVShowsByCharacter.execute(character.id);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Loki');
    expect(result[0].role_type).toBe('main');
  });

  it('Should not include movie appearances', async () => {
    const character = await fakeCharactersRepository.create({
      name: 'Loki',
      continuity: 'MCU',
    });

    fakeCharactersRepository.seedAppearance({
      character_id: character.id,
      movie,
      role_type: 'supporting',
    });

    const result = await getTVShowsByCharacter.execute(character.id);

    expect(result).toHaveLength(0);
  });

  it('Should return empty array when the character has no tv show appearances', async () => {
    const character = await fakeCharactersRepository.create({
      name: 'Happy Hogan',
      continuity: 'MCU',
    });

    const result = await getTVShowsByCharacter.execute(character.id);

    expect(result).toHaveLength(0);
  });

  it('Should throw a 404 error when the character does not exist', async () => {
    await expect(getTVShowsByCharacter.execute(999)).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(getTVShowsByCharacter.execute(999)).rejects.toHaveProperty(
      'statusCode',
      404,
    );
  });
});
