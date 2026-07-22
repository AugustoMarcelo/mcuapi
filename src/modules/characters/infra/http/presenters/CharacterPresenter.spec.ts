import ICharacter from '@modules/characters/entities/ICharacter';
import IMovie from '@modules/movies/entities/IMovie';
import { presentCharacter, presentCharacterArray } from './CharacterPresenter';

const baseUrl = 'http://localhost:3333';

const character: ICharacter = {
  id: 7,
  name: 'Loki',
  continuity: 'MCU',
};

describe('CharacterPresenter', () => {
  it('Should add self, movies and tvshows links', () => {
    const presented = presentCharacter(character, baseUrl);

    expect(presented._links.self).toEqual({ href: `${baseUrl}/api/v1/characters/7` });
    expect(presented._links.movies).toEqual({ href: `${baseUrl}/api/v1/characters/7/movies` });
    expect(presented._links.tvshows).toEqual({ href: `${baseUrl}/api/v1/characters/7/tvshows` });
  });

  it('Should omit variant_of and first_appearance links when the FKs are null', () => {
    const presented = presentCharacter(character, baseUrl);

    expect(presented._links.variant_of).toBeUndefined();
    expect(presented._links.first_appearance_movie).toBeUndefined();
    expect(presented._links.first_appearance_tvshow).toBeUndefined();
  });

  it('Should link variant_of and first appearances from the FK columns', () => {
    const presented = presentCharacter(
      {
        ...character,
        variant_of: 3,
        first_appearance_movie_id: 5,
        first_appearance_tvshow_id: 9,
      },
      baseUrl,
    );

    expect(presented._links.variant_of).toEqual({ href: `${baseUrl}/api/v1/characters/3` });
    expect(presented._links.first_appearance_movie).toEqual({ href: `${baseUrl}/api/v1/movies/5` });
    expect(presented._links.first_appearance_tvshow).toEqual({ href: `${baseUrl}/api/v1/tvshows/9` });
  });

  it('Should add self-only links to embedded relation objects', () => {
    const presented = presentCharacter(
      {
        ...character,
        first_appearance_movie_id: 5,
        first_appearance_movie: { id: 5, title: 'Thor' } as IMovie,
      },
      baseUrl,
    );

    expect(presented.first_appearance_movie).toMatchObject({
      id: 5,
      _links: { self: { href: `${baseUrl}/api/v1/movies/5` } },
    });
  });

  it('Should preserve role_type on array items', () => {
    const presented = presentCharacterArray([{ ...character, role_type: 'main' }], baseUrl);

    expect(presented[0].role_type).toBe('main');
    expect(presented[0]._links.self).toEqual({ href: `${baseUrl}/api/v1/characters/7` });
  });

  it('Should skip id-dependent links when id is missing but keep FK links', () => {
    const presented = presentCharacter(
      { name: 'Loki', variant_of: 3 } as ICharacter,
      baseUrl,
    );

    expect(presented._links.self).toBeUndefined();
    expect(presented._links.movies).toBeUndefined();
    expect(presented._links.variant_of).toEqual({ href: `${baseUrl}/api/v1/characters/3` });
  });
});
