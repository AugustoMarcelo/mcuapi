import IMovie from '@modules/movies/entities/IMovie';
import {
  ILink,
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

interface IPresentMovieCollectionParams {
  data: IMovie[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

export function presentMovie(
  movie: IMovie,
  baseUrl: string,
): WithLinks<IMovie> {
  const _links: IResourceLinks = {};

  if (movie.id != null) {
    _links.self = { href: `${baseUrl}/api/v1/movies/${movie.id}` };
    _links.characters = {
      href: `${baseUrl}/api/v1/characters/movie/${movie.id}`,
    };
  }

  const { related_movies, related_tvshows, ...movieWithoutRelations } = movie;

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

  return { ...movieWithoutRelations, _links };
}

export function presentMovieCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentMovieCollectionParams) {
  const { _links, meta } = buildPaginationLinks({
    baseUrl,
    path,
    query,
    page,
    limit,
    total,
  });

  return {
    data: data.map(movie => presentMovie(movie, baseUrl)),
    total,
    ...meta,
    _links,
  };
}
