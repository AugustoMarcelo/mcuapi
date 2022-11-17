import IMovie from '@modules/movies/entities/IMovie';

type MovieResponse = Omit<IMovie, 'streamings'> & {
  streamings?: Array<{
    platform: string;
    url: string;
  }>;
};

export function mapView(movie: IMovie): MovieResponse {
  return {
    ...movie,
    streamings: movie.streamings?.map(streaming => ({
      platform: streaming.platform,
      url: streaming.url,
    })),
  };
}
