import ICharacter from '@modules/characters/entities/ICharacter';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import {
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

type ICharacterWithRelations = ICharacter & {
  variant_character?: ICharacter;
  first_appearance_movie?: IMovie;
  first_appearance_tvshow?: ITVShow;
  role_type?: string;
};

interface IPresentCharacterCollectionParams {
  data: ICharacter[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

function withSelfLink<T extends { id?: number }>(
  entity: T | undefined,
  selfHref: (id: number) => string,
): (T & { _links: IResourceLinks }) | undefined {
  if (!entity) return undefined;

  return {
    ...entity,
    _links: entity.id != null ? { self: { href: selfHref(entity.id) } } : {},
  };
}

export function presentCharacter(
  character: ICharacterWithRelations,
  baseUrl: string,
): WithLinks<ICharacterWithRelations> {
  const _links: IResourceLinks = {};

  if (character.id != null) {
    _links.self = { href: `${baseUrl}/api/v1/characters/${character.id}` };
    _links.movies = { href: `${baseUrl}/api/v1/characters/${character.id}/movies` };
    _links.tvshows = { href: `${baseUrl}/api/v1/characters/${character.id}/tvshows` };
  }

  if (character.variant_of != null) {
    _links.variant_of = { href: `${baseUrl}/api/v1/characters/${character.variant_of}` };
  }

  if (character.first_appearance_movie_id != null) {
    _links.first_appearance_movie = {
      href: `${baseUrl}/api/v1/movies/${character.first_appearance_movie_id}`,
    };
  }

  if (character.first_appearance_tvshow_id != null) {
    _links.first_appearance_tvshow = {
      href: `${baseUrl}/api/v1/tvshows/${character.first_appearance_tvshow_id}`,
    };
  }

  const variant_character = withSelfLink(
    character.variant_character,
    id => `${baseUrl}/api/v1/characters/${id}`,
  );
  const first_appearance_movie = withSelfLink(
    character.first_appearance_movie,
    id => `${baseUrl}/api/v1/movies/${id}`,
  );
  const first_appearance_tvshow = withSelfLink(
    character.first_appearance_tvshow,
    id => `${baseUrl}/api/v1/tvshows/${id}`,
  );

  return {
    ...character,
    ...(variant_character && { variant_character }),
    ...(first_appearance_movie && { first_appearance_movie }),
    ...(first_appearance_tvshow && { first_appearance_tvshow }),
    _links,
  };
}

export function presentCharacterArray(
  characters: ICharacterWithRelations[],
  baseUrl: string,
): Array<WithLinks<ICharacterWithRelations>> {
  return characters.map(character => presentCharacter(character, baseUrl));
}

export function presentCharacterCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentCharacterCollectionParams) {
  const { _links, meta } = buildPaginationLinks({ baseUrl, path, query, page, limit, total });

  return {
    data: presentCharacterArray(data, baseUrl),
    total,
    ...meta,
    _links,
  };
}
