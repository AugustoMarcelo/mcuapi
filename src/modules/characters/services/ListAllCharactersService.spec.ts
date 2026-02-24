import FakeCharactersRepository from '../repositories/fakes/FakeCharactersRepository';
import ListAllCharactersService from './ListAllCharactersService';

let fakeCharactersRepository: FakeCharactersRepository;
let listAllCharacters: ListAllCharactersService;

describe('ListAllCharacters', () => {
  beforeEach(() => {
    fakeCharactersRepository = new FakeCharactersRepository();
    listAllCharacters = new ListAllCharactersService(fakeCharactersRepository);
  });

  it('Should be able to list all characters', async () => {
    // Create some test characters
    await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      continuity: 'MCU',
      multiverse_designation: 'Earth-199999',
    });

    await fakeCharactersRepository.create({
      name: 'Steve Rogers',
      alias: 'Captain America',
      continuity: 'MCU',
      multiverse_designation: 'Earth-199999',
    });

    await fakeCharactersRepository.create({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'Sony Spider-Man Universe',
      multiverse_designation: 'Earth-96283',
    });

    const result = await listAllCharacters.execute({
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('Should be able to filter characters by continuity', async () => {
    // Create characters from different continuities
    await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      continuity: 'MCU',
      multiverse_designation: 'Earth-199999',
    });

    await fakeCharactersRepository.create({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'Sony Spider-Man Universe',
      multiverse_designation: 'Earth-96283',
    });

    const result = await listAllCharacters.execute({
      page: 1,
      limit: 10,
      continuity: 'MCU',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].continuity).toBe('MCU');
  });

  it('Should be able to filter characters by multiverse designation', async () => {
    await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      continuity: 'MCU',
      multiverse_designation: 'Earth-199999',
    });

    await fakeCharactersRepository.create({
      name: 'Peter Parker',
      alias: 'Spider-Man',
      continuity: 'Sony Spider-Man Universe',
      multiverse_designation: 'Earth-96283',
    });

    const result = await listAllCharacters.execute({
      page: 1,
      limit: 10,
      multiverse_designation: 'Earth-96283',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].multiverse_designation).toBe('Earth-96283');
  });

  it('Should be able to filter characters by name', async () => {
    await fakeCharactersRepository.create({
      name: 'Tony Stark',
      alias: 'Iron Man',
      continuity: 'MCU',
    });

    await fakeCharactersRepository.create({
      name: 'Steve Rogers',
      alias: 'Captain America',
      continuity: 'MCU',
    });

    const result = await listAllCharacters.execute({
      page: 1,
      limit: 10,
      filter: 'name=Tony',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Tony Stark');
  });

  it('Should be able to paginate results', async () => {
    // Create 5 characters
    for (let i = 1; i <= 5; i++) {
      await fakeCharactersRepository.create({
        name: `Character ${i}`,
        alias: `Alias ${i}`,
        continuity: 'MCU',
      });
    }

    const result = await listAllCharacters.execute({
      page: 1,
      limit: 3,
    });

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
  });
}); 