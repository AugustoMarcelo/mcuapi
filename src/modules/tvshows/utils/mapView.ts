import ITVShow from '@modules/tvshows/entities/ITVShow';

type TVShowResponse = Omit<ITVShow, 'streamings'> & {
  streamings?: Array<{
    platform: string;
    url: string;
  }>;
};

export function mapView(tvshow: ITVShow): TVShowResponse {
  return {
    ...tvshow,
    streamings: tvshow.streamings?.map(streaming => ({
      platform: streaming.platform,
      url: streaming.url,
    })),
  };
}
