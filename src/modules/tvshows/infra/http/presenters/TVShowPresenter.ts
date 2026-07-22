import ITVShow from '@modules/tvshows/entities/ITVShow';
import {
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

export function presentTVShow(tvshow: ITVShow, baseUrl: string): WithLinks<ITVShow> {
  const _links: IResourceLinks = {};

  if (tvshow.id != null) {
    _links.self = { href: `${baseUrl}/api/v1/tvshows/${tvshow.id}` };
    _links.characters = { href: `${baseUrl}/api/v1/characters/tvshow/${tvshow.id}` };
  }

  return { ...tvshow, _links };
}

export function presentTVShowCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentTVShowCollectionParams) {
  const { _links, meta } = buildPaginationLinks({ baseUrl, path, query, page, limit, total });

  return {
    data: data.map(tvshow => presentTVShow(tvshow, baseUrl)),
    total,
    ...meta,
    _links,
  };
}
