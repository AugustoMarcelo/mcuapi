import IMovieEdition from '@modules/movieEditions/entities/IMovieEdition';
import {
  buildPaginationLinks,
  IResourceLinks,
  WithLinks,
} from '@shared/infra/http/hateoas';

export function presentMovieEdition(
  edition: IMovieEdition,
  baseUrl: string,
): WithLinks<IMovieEdition> {
  return {
    ...edition,
    _links: {
      self: { href: `${baseUrl}/api/v1/movie-editions/${edition.id}` },
      movie: { href: `${baseUrl}/api/v1/movies/${edition.movie_id}` },
      teased_movies: edition.teased_movies.map(movie => ({
        href: `${baseUrl}/api/v1/movies/${movie.id}`,
      })),
    },
  };
}

export function presentMovieEditionCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: {
  data: IMovieEdition[];
  total: number;
  page: number;
  limit: number;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}): {
  data: Array<WithLinks<IMovieEdition>>;
  total: number;
  page: number;
  limit: number;
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
    data: data.map(edition => presentMovieEdition(edition, baseUrl)),
    total,
    ...meta,
    _links,
  };
}
