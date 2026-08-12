import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import GetCharactersByTVShowService from './GetCharactersByTVShowService';

let fakeCharactersRepository: FakeCharactersRepository;
let getCharactersByTVShow: GetCharactersByTVShowService;

describe('GetCharactersByTVShow', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    getCharactersByTVShow = new GetCharactersByTVShowService(
      fakeCharactersRepository,
    );
  });

  it('Should be able to get characters by TV show id', async () => {
    await fakeCharactersRepository.create({
      name: 'Wanda Maximoff',
      alias: 'Scarlet Witch',
      continuity: 'MCU',
      first_appearance_tvshow_id: 1,
    });

    await fakeCharactersRepository.create({
      name: 'Vision',
      continuity: 'MCU',
      first_appearance_tvshow_id: 1,
    });

    await fakeCharactersRepository.create({
      name: 'Nick Fury',
      continuity: 'MCU',
      first_appearance_tvshow_id: 2,
    });

    const characters = await getCharactersByTVShow.execute(1);

    expect(characters).toHaveLength(2);
    expect(characters[0].name).toBe('Wanda Maximoff');
    expect(characters[1].name).toBe('Vision');
  });

  it('Should return empty array when no characters found for TV show', async () => {
    const characters = await getCharactersByTVShow.execute(999);

    expect(characters).toHaveLength(0);
  });
});
