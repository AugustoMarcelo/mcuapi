import FakePeopleRepository from '../repositories/fakes/FakePeopleRepository';
import GetTitlesByPersonService from './GetTitlesByPersonService';
import AppError from '@shared/errors/AppError';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';

let fakePeopleRepository: FakePeopleRepository;
let getTitlesByPerson: GetTitlesByPersonService;

const ironMan = {
  id: 1,
  title: 'Iron Man',
  release_date: new Date('2008-05-02'),
  directed_by: 'Jon Favreau',
  post_credit_scenes: 1,
} as IMovie;

const loki = {
  id: 1,
  title: 'Loki',
  release_date: new Date('2021-06-09'),
  season: 1,
  number_episodes: 6,
} as ITVShow;

describe('GetTitlesByPerson', () => {
  beforeEach(() => {
    fakePeopleRepository = new FakePeopleRepository();
    getTitlesByPerson = new GetTitlesByPersonService(fakePeopleRepository);
  });

  it('Should return movies and tv shows directed by the person, merged and sorted by release date', async () => {
    const person = fakePeopleRepository.seedPerson({ name: 'Jon Favreau' });

    fakePeopleRepository.seedTitleLink({
      person_id: person.id,
      tvshow: loki,
      role: 'director',
    });
    fakePeopleRepository.seedTitleLink({
      person_id: person.id,
      movie: ironMan,
      role: 'director',
    });

    const result = await getTitlesByPerson.execute(person.id);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Iron Man');
    expect(result[0].type).toBe('movie');
    expect(result[0].role).toBe('director');
    expect(result[1].title).toBe('Loki');
    expect(result[1].type).toBe('tvshow');
  });

  it('Should return empty array when the person has directed nothing', async () => {
    const person = fakePeopleRepository.seedPerson({ name: 'Extra' });

    const result = await getTitlesByPerson.execute(person.id);

    expect(result).toHaveLength(0);
  });

  it('Should throw a 404 error when the person does not exist', async () => {
    await expect(getTitlesByPerson.execute(999)).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(getTitlesByPerson.execute(999)).rejects.toHaveProperty(
      'statusCode',
      404,
    );
  });
});
