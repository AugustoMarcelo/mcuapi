import IUpcomingItemDTO from '@modules/upcoming/dtos/IUpcomingItemDTO';
import {
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

interface IPresentUpcomingCollectionParams {
  data: IUpcomingItemDTO[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

export function presentUpcomingItem(
  item: IUpcomingItemDTO,
  baseUrl: string,
): WithLinks<IUpcomingItemDTO> {
  const resourcePath = item.type === 'tvshow' ? 'tvshows' : 'movies';

  return {
    ...item,
    _links: {
      self: { href: `${baseUrl}/api/v1/${resourcePath}/${item.id}` },
    },
  };
}

export function presentUpcomingCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentUpcomingCollectionParams): {
  data: WithLinks<IUpcomingItemDTO>[];
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
    data: data.map(item => presentUpcomingItem(item, baseUrl)),
    total,
    ...meta,
    _links,
  };
}
