import IStreamingAvailability from '@modules/streaming/entities/IStreamingAvailability';

interface IPresentedOffer {
  provider: string;
  url: string | null;
}

interface IPresentedRegion {
  region: string;
  offers: IPresentedOffer[];
}

interface IPresentCollectionDTO {
  rows: IStreamingAvailability[];
  baseUrl: string;
  type: 'movies' | 'tvshows';
  title_id: number;
  region?: string;
}

/**
 * Groups by region, because "where can I watch this" is always asked from
 * somewhere. A flat list forces every consumer to do the same grouping.
 */
export function presentStreamingCollection({
  rows,
  baseUrl,
  type,
  title_id,
  region,
}: IPresentCollectionDTO): {
  data: IPresentedRegion[];
  total: number;
  _links: Record<string, { href: string }>;
} {
  const byRegion = new Map<string, IPresentedOffer[]>();

  rows.forEach(row => {
    const offers = byRegion.get(row.region) ?? [];
    offers.push({ provider: row.provider, url: row.url ?? null });
    byRegion.set(row.region, offers);
  });

  // forEach rather than spreading the iterator: the API build targets ES5.
  const data: IPresentedRegion[] = [];
  byRegion.forEach((offers, name) => data.push({ region: name, offers }));
  data.sort((a, b) => a.region.localeCompare(b.region));

  const query = region ? `?region=${encodeURIComponent(region)}` : '';

  return {
    data,
    total: rows.length,
    _links: {
      self: {
        href: `${baseUrl}/api/v1/${type}/${title_id}/streaming${query}`,
      },
      title: { href: `${baseUrl}/api/v1/${type}/${title_id}` },
      providers: { href: `${baseUrl}/api/v1/streaming/providers` },
    },
  };
}

export default presentStreamingCollection;
