import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListAllPeopleService from '@modules/people/services/ListAllPeopleService';
import ShowPersonService from '@modules/people/services/ShowPersonService';
import GetCharactersByPersonService from '@modules/people/services/GetCharactersByPersonService';
import GetTitlesByPersonService from '@modules/people/services/GetTitlesByPersonService';
import {
  presentPerson,
  presentPersonCollection,
  presentPersonTitleArray,
} from '@modules/people/infra/http/presenters/PersonPresenter';
import { presentCharacterArray } from '@modules/characters/infra/http/presenters/CharacterPresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import {
  resolveLimit,
  resolvePage,
  resolvePositiveInteger,
} from '@shared/infra/http/pagination';
import {
  resolveColumns,
  resolveFilter,
  resolveOrder,
} from '@shared/infra/http/listParams';
import PEOPLE_COLUMNS from '@modules/people/entities/peopleColumns';

interface IRequestQuery {
  columns?: string;
  order?: string;
  filter?: string;
}

export default class PeopleController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { columns, order, filter }: IRequestQuery = request.query;

    const page = resolvePage(request.query.page);
    const limit = resolveLimit(request.query.limit);

    const listAllPeople = container.resolve(ListAllPeopleService);
    const { data, total } = await listAllPeople.execute({
      page,
      limit,
      columns: resolveColumns(columns, PEOPLE_COLUMNS),
      order: resolveOrder(order, PEOPLE_COLUMNS),
      filter: resolveFilter(filter, PEOPLE_COLUMNS),
    });

    return response.status(200).json(
      presentPersonCollection({
        data,
        total,
        page,
        limit,
        baseUrl: getBaseUrl(request),
        path: request.baseUrl + request.path,
        query: request.query,
      }),
    );
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { person_id } = request.params;

    const showPerson = container.resolve(ShowPersonService);

    const person = await showPerson.execute({
      person_id: resolvePositiveInteger({
        value: person_id,
        name: 'person_id',
      }),
    });

    return response
      .status(200)
      .json(presentPerson(person, getBaseUrl(request)));
  }

  public async getCharacters(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { person_id } = request.params;

    const getCharactersByPerson = container.resolve(
      GetCharactersByPersonService,
    );
    const characters = await getCharactersByPerson.execute(
      resolvePositiveInteger({ value: person_id, name: 'person_id' }),
    );

    return response
      .status(200)
      .json(presentCharacterArray(characters, getBaseUrl(request)));
  }

  public async getTitles(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { person_id } = request.params;

    const getTitlesByPerson = container.resolve(GetTitlesByPersonService);
    const titles = await getTitlesByPerson.execute(
      resolvePositiveInteger({ value: person_id, name: 'person_id' }),
    );

    return response
      .status(200)
      .json(presentPersonTitleArray(titles, getBaseUrl(request)));
  }
}
