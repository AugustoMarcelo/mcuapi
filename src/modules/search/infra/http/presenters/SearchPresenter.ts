import ISearchHitDTO from '@modules/search/dtos/ISearchHitDTO';
import { presentMovie } from '@modules/movies/infra/http/presenters/MoviePresenter';
import { presentTVShow } from '@modules/tvshows/infra/http/presenters/TVShowPresenter';
import { presentCharacter } from '@modules/characters/infra/http/presenters/CharacterPresenter';
import { presentPerson } from '@modules/people/infra/http/presenters/PersonPresenter';
import {
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

interface IPresentSearchCollectionParams {
  data: ISearchHitDTO[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

export function presentSearchHit(
  hit: ISearchHitDTO,
  baseUrl: string,
): WithLinks<ISearchHitDTO> {
  switch (hit.type) {
    case 'movie':
      return { ...presentMovie(hit, baseUrl), type: 'movie' };
    case 'tvshow':
      return { ...presentTVShow(hit, baseUrl), type: 'tvshow' };
    case 'character':
      return { ...presentCharacter(hit, baseUrl), type: 'character' };
    case 'person':
      return { ...presentPerson(hit, baseUrl), type: 'person' };
    default:
      return hit;
  }
}

export function presentSearchCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentSearchCollectionParams): {
  data: Array<WithLinks<ISearchHitDTO>>;
  total: number;
  page: number;
  limit?: number;
  _links: IResourceLinks;
} {
  const { _links, meta } = buildPaginationLinks({
    baseUrl,
    path,
    query,
    page,
    limit,
    total,
  });

  return {
    data: data.map(hit => presentSearchHit(hit, baseUrl)),
    total,
    ...meta,
    _links,
  };
}
