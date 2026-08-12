import {
  presentPerson,
  presentPersonCollection,
  presentPersonTitle,
  presentPersonTitleArray,
} from './PersonPresenter';
import IPerson from '@modules/people/entities/IPerson';
import IPersonTitleDTO from '@modules/people/dtos/IPersonTitleDTO';

const baseUrl = 'http://localhost:3333';

const person: IPerson = {
  id: 7,
  name: 'Robert Downey Jr.',
};

describe('PersonPresenter', () => {
  it('Should add self, characters and titles links', () => {
    const presented = presentPerson(person, baseUrl);

    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/people/7`,
    });
    expect(presented._links.characters).toEqual({
      href: `${baseUrl}/api/v1/people/7/characters`,
    });
    expect(presented._links.titles).toEqual({
      href: `${baseUrl}/api/v1/people/7/titles`,
    });
  });

  it('Should skip id-dependent links when id is missing', () => {
    const presented = presentPerson({ name: 'No ID' } as IPerson, baseUrl);

    expect(presented._links.self).toBeUndefined();
    expect(presented._links.characters).toBeUndefined();
    expect(presented._links.titles).toBeUndefined();
  });

  it('Should wrap a collection with pagination links and meta', () => {
    const presented = presentPersonCollection({
      data: [person],
      total: 1,
      page: 1,
      limit: 10,
      baseUrl,
      path: '/api/v1/people',
      query: {},
    });

    expect(presented.data).toHaveLength(1);
    expect(presented.total).toBe(1);
    expect(presented.page).toBe(1);
    expect(presented._links.self).toBeDefined();
  });

  it('Should present a movie title with a movies self link', () => {
    const title: IPersonTitleDTO = {
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Favreau',
      post_credit_scenes: 1,
      type: 'movie',
      role: 'director',
    } as IPersonTitleDTO;

    const presented = presentPersonTitle(title, baseUrl);

    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/movies/1`,
    });
    expect(presented.role).toBe('director');
  });

  it('Should present a tvshow title with a tvshows self link', () => {
    const title: IPersonTitleDTO = {
      id: 1,
      title: 'Loki',
      season: 1,
      number_episodes: 6,
      type: 'tvshow',
      role: 'director',
    } as IPersonTitleDTO;

    const presented = presentPersonTitle(title, baseUrl);

    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/1`,
    });
    expect(presented.role).toBe('director');
  });

  it('Should present an array of mixed titles', () => {
    const titles: IPersonTitleDTO[] = [
      {
        id: 1,
        title: 'Iron Man',
        directed_by: 'Jon Favreau',
        post_credit_scenes: 1,
        type: 'movie',
        role: 'director',
      } as IPersonTitleDTO,
      {
        id: 1,
        title: 'Loki',
        season: 1,
        number_episodes: 6,
        type: 'tvshow',
        role: 'director',
      } as IPersonTitleDTO,
    ];

    const presented = presentPersonTitleArray(titles, baseUrl);

    expect(presented).toHaveLength(2);
    expect(presented[0]._links.self).toEqual({
      href: `${baseUrl}/api/v1/movies/1`,
    });
    expect(presented[1]._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/1`,
    });
  });
});
