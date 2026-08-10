import IStatsResponseDTO from '@modules/stats/dtos/IStatsResponseDTO';
import { IResourceLinks, WithLinks } from '@shared/infra/http/hateoas';

export function presentStats(
  stats: IStatsResponseDTO,
  baseUrl: string,
): WithLinks<IStatsResponseDTO> {
  const _links: IResourceLinks = {
    self: { href: `${baseUrl}/api/v1/stats` },
  };

  return { ...stats, _links };
}
