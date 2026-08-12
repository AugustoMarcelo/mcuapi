import IPerson from '@modules/people/entities/IPerson';
import IPersonTitleDTO from '@modules/people/dtos/IPersonTitleDTO';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import { presentMovie } from '@modules/movies/infra/http/presenters/MoviePresenter';
import { presentTVShow } from '@modules/tvshows/infra/http/presenters/TVShowPresenter';
import {
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

interface IPresentPersonCollectionParams {
  data: IPerson[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

interface IPresentPersonCollectionResult {
  data: Array<WithLinks<IPerson>>;
  total: number;
  page: number;
  limit?: number;
  _links: IResourceLinks;
}

export function presentPerson(
  person: IPerson,
  baseUrl: string,
): WithLinks<IPerson> {
  const _links: IResourceLinks = {};

  if (person.id != null) {
    _links.self = { href: `${baseUrl}/api/v1/people/${person.id}` };
    _links.characters = {
      href: `${baseUrl}/api/v1/people/${person.id}/characters`,
    };
    _links.titles = { href: `${baseUrl}/api/v1/people/${person.id}/titles` };
  }

  return { ...person, _links };
}

export function presentPersonCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentPersonCollectionParams): IPresentPersonCollectionResult {
  const { _links, meta } = buildPaginationLinks({
    baseUrl,
    path,
    query,
    page,
    limit,
    total,
  });

  return {
    data: data.map(person => presentPerson(person, baseUrl)),
    total,
    ...meta,
    _links,
  };
}

export function presentPersonTitle(
  title: IPersonTitleDTO,
  baseUrl: string,
): WithLinks<IPersonTitleDTO> {
  return title.type === 'tvshow'
    ? (presentTVShow(title as ITVShow, baseUrl) as WithLinks<IPersonTitleDTO>)
    : (presentMovie(title as IMovie, baseUrl) as WithLinks<IPersonTitleDTO>);
}

export function presentPersonTitleArray(
  titles: IPersonTitleDTO[],
  baseUrl: string,
): Array<WithLinks<IPersonTitleDTO>> {
  return titles.map(title => presentPersonTitle(title, baseUrl));
}
