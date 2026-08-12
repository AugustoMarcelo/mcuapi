import ICharacter from '@modules/characters/entities/ICharacter';
import {
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

type ICharacterWithRelations = ICharacter & {
  role_type?: string;
  appeared_in?: string;
  variant_character?: unknown;
  first_appearance_movie?: unknown;
  first_appearance_tvshow?: unknown;
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

export function presentCharacter(
  character: ICharacterWithRelations,
  baseUrl: string,
): WithLinks<ICharacterWithRelations> {
  const _links: IResourceLinks = {};

  if (character.id != null) {
    _links.self = { href: `${baseUrl}/api/v1/characters/${character.id}` };
    _links.movies = {
      href: `${baseUrl}/api/v1/characters/${character.id}/movies`,
    };
    _links.tvshows = {
      href: `${baseUrl}/api/v1/characters/${character.id}/tvshows`,
    };
  }

  if (character.variant_of != null) {
    _links.variant_of = {
      href: `${baseUrl}/api/v1/characters/${character.variant_of}`,
    };
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

  const characterWithoutEmbeddedRelations: ICharacterWithRelations = {
    ...character,
  };
  delete characterWithoutEmbeddedRelations.variant_character;
  delete characterWithoutEmbeddedRelations.first_appearance_movie;
  delete characterWithoutEmbeddedRelations.first_appearance_tvshow;

  return {
    ...characterWithoutEmbeddedRelations,
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
  const { _links, meta } = buildPaginationLinks({
    baseUrl,
    path,
    query,
    page,
    limit,
    total,
  });

  return {
    data: presentCharacterArray(data, baseUrl),
    total,
    ...meta,
    _links,
  };
}
