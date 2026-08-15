import ITVShow from '@modules/tvshows/entities/ITVShow';
import {
  ILink,
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

interface IPresentTVShowCollectionParams {
  data: ITVShow[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

interface IPresentTVShowCollectionResult {
  data: Array<WithLinks<ITVShow>>;
  total: number;
  page: number;
  limit?: number;
  _links: IResourceLinks;
}

export function presentTVShow(
  tvshow: ITVShow,
  baseUrl: string,
): WithLinks<ITVShow> {
  const _links: IResourceLinks = {};

  if (tvshow.id != null) {
    _links.self = { href: `${baseUrl}/api/v1/tvshows/${tvshow.id}` };
    _links.characters = {
      href: `${baseUrl}/api/v1/characters/tvshow/${tvshow.id}`,
    };
    _links.post_credit_scenes = {
      href: `${baseUrl}/api/v1/post-credit-scenes/tvshow/${tvshow.id}`,
    };
  }

  const { related_movies, related_tvshows, ...tvshowWithoutRelations } = tvshow;

  if (Array.isArray(related_movies)) {
    _links.related_movies = related_movies
      .filter(related => related.id != null)
      .map<ILink>(related => ({
        href: `${baseUrl}/api/v1/movies/${related.id}`,
      }));
  }

  if (Array.isArray(related_tvshows)) {
    _links.related_tvshows = related_tvshows
      .filter(related => related.id != null)
      .map<ILink>(related => ({
        href: `${baseUrl}/api/v1/tvshows/${related.id}`,
      }));
  }

  return { ...tvshowWithoutRelations, _links };
}

export function presentTVShowCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentTVShowCollectionParams): IPresentTVShowCollectionResult {
  const { _links, meta } = buildPaginationLinks({
    baseUrl,
    path,
    query,
    page,
    limit,
    total,
  });

  return {
    data: data.map(tvshow => presentTVShow(tvshow, baseUrl)),
    total,
    ...meta,
    _links,
  };
}
