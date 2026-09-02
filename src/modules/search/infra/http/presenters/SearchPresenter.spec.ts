import { presentSearchCollection, presentSearchHit } from './SearchPresenter';
import ISearchHitDTO from '@modules/search/dtos/ISearchHitDTO';

const baseUrl = 'http://localhost:3333';

describe('SearchPresenter', () => {
  it('Should link a movie hit at its underlying resource', () => {
    const hit: ISearchHitDTO = {
      type: 'movie',
      id: 1,
      title: 'Iron Man',
      directed_by: 'Jon Favreau',
      post_credit_scenes: 1,
    };

    const presented = presentSearchHit(hit, baseUrl);

    expect(presented.type).toBe('movie');
    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/movies/1`,
    });
  });

  it('Should link a tvshow hit at its underlying resource', () => {
    const hit: ISearchHitDTO = {
      type: 'tvshow',
      id: 8,
      title: 'Loki',
      season: 1,
      number_episodes: 6,
      post_credit_scenes: 0,
    };

    const presented = presentSearchHit(hit, baseUrl);

    expect(presented.type).toBe('tvshow');
    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/8`,
    });
  });

  it('Should carry the full character record with movies/tvshows links', () => {
    const hit: ISearchHitDTO = {
      type: 'character',
      id: 2,
      name: 'Tony Stark',
      alias: 'Iron Man',
      played_by: 'Robert Downey Jr.',
      continuity: 'MCU',
      multiverse_designation: 'Earth-616',
    };

    const presented = presentSearchHit(hit, baseUrl);

    expect(presented).toMatchObject({
      type: 'character',
      alias: 'Iron Man',
      played_by: 'Robert Downey Jr.',
      multiverse_designation: 'Earth-616',
      continuity: 'MCU',
    });
    expect(presented._links.movies).toEqual({
      href: `${baseUrl}/api/v1/characters/2/movies`,
    });
    expect(presented._links.tvshows).toEqual({
      href: `${baseUrl}/api/v1/characters/2/tvshows`,
    });
  });

  it('Should link a person hit at its underlying resource', () => {
    const hit: ISearchHitDTO = {
      type: 'person',
      id: 3,
      name: 'Robert Downey Jr.',
    };

    const presented = presentSearchHit(hit, baseUrl);

    expect(presented.type).toBe('person');
    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/people/3`,
    });
  });

  it('Should carry standard pagination links across mixed-type results', () => {
    const data: ISearchHitDTO[] = [
      {
        type: 'movie',
        id: 1,
        title: 'Iron Man',
        directed_by: 'Jon Favreau',
        post_credit_scenes: 1,
      },
      { type: 'person', id: 3, name: 'Robert Downey Jr.' },
    ];

    const presented = presentSearchCollection({
      data,
      total: 2,
      page: 1,
      limit: 10,
      baseUrl,
      path: '/api/v1/search',
      query: { q: 'Iron Man' },
    });

    expect(presented.data).toHaveLength(2);
    expect(presented.total).toBe(2);
    expect(presented._links.self).toBeDefined();
    expect(presented._links.first).toBeDefined();
    expect(presented._links.last).toBeDefined();
  });
});
