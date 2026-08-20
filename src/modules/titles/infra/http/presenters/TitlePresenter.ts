import ITitleItemDTO from '@modules/titles/dtos/ITitleItemDTO';
import {
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

interface IPresentTitleCollectionParams {
  data: ITitleItemDTO[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

export function presentTitleItem(
  item: ITitleItemDTO,
  baseUrl: string,
): WithLinks<ITitleItemDTO> {
  const resourcePath = item.type === 'tvshow' ? 'tvshows' : 'movies';

  return {
    ...item,
    _links: {
      self: { href: `${baseUrl}/api/v1/${resourcePath}/${item.id}` },
    },
  };
}

export function presentTitleCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentTitleCollectionParams): {
  data: WithLinks<ITitleItemDTO>[];
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
    data: data.map(item => presentTitleItem(item, baseUrl)),
    total,
    ...meta,
    _links,
  };
}
