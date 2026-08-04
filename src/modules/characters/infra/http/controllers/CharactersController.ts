import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListAllCharactersService from '@modules/characters/services/ListAllCharactersService';
import ShowCharacterService from '@modules/characters/services/ShowCharacterService';
import GetCharactersByMovieService from '@modules/characters/services/GetCharactersByMovieService';
import GetCharactersByTVShowService from '@modules/characters/services/GetCharactersByTVShowService';
import GetMoviesByCharacterService from '@modules/characters/services/GetMoviesByCharacterService';
import GetTVShowsByCharacterService from '@modules/characters/services/GetTVShowsByCharacterService';
import {
  presentCharacter,
  presentCharacterArray,
  presentCharacterCollection,
} from '@modules/characters/infra/http/presenters/CharacterPresenter';
import { presentMovie } from '@modules/movies/infra/http/presenters/MoviePresenter';
import { presentTVShow } from '@modules/tvshows/infra/http/presenters/TVShowPresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@shared/infra/http/pagination';

interface IRequestQuery {
  columns?: string;
  order?: string;
  filter?: string;
  continuity?: string;
  multiverse_designation?: string;
}

export default class CharactersController {
  public async index(request: Request, response: Response): Promise<Response> {
    const {
      columns,
      order,
      filter,
      continuity,
      multiverse_designation,
    }: IRequestQuery = request.query;

    const page = Number(request.query.page) || DEFAULT_PAGE;
    const limit = Number(request.query.limit) || DEFAULT_LIMIT;

    const listAllCharacters = container.resolve(ListAllCharactersService);
    const { data, total } = await listAllCharacters.execute({
      page,
      limit,
      columns,
      order,
      filter,
      continuity,
      multiverse_designation,
    });

    return response.status(200).json(
      presentCharacterCollection({
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
    const { character_id } = request.params;

    const showCharacter = container.resolve(ShowCharacterService);

    const character = await showCharacter.execute({ character_id: Number(character_id) });

    return response.status(200).json(presentCharacter(character, getBaseUrl(request)));
  }

  public async getByMovie(request: Request, response: Response): Promise<Response> {
    const { movie_id } = request.params;

    const getCharactersByMovie = container.resolve(GetCharactersByMovieService);
    const characters = await getCharactersByMovie.execute(Number(movie_id));

    return response.status(200).json(presentCharacterArray(characters, getBaseUrl(request)));
  }

  public async getByTVShow(request: Request, response: Response): Promise<Response> {
    const { tvshow_id } = request.params;

    const getCharactersByTVShow = container.resolve(GetCharactersByTVShowService);
    const characters = await getCharactersByTVShow.execute(Number(tvshow_id));

    return response.status(200).json(presentCharacterArray(characters, getBaseUrl(request)));
  }

  public async getMovies(request: Request, response: Response): Promise<Response> {
    const { character_id } = request.params;

    const getMoviesByCharacter = container.resolve(GetMoviesByCharacterService);
    const movies = await getMoviesByCharacter.execute(Number(character_id));

    const baseUrl = getBaseUrl(request);

    return response.status(200).json(movies.map(movie => presentMovie(movie, baseUrl)));
  }

  public async getTVShows(request: Request, response: Response): Promise<Response> {
    const { character_id } = request.params;

    const getTVShowsByCharacter = container.resolve(GetTVShowsByCharacterService);
    const tvshows = await getTVShowsByCharacter.execute(Number(character_id));

    const baseUrl = getBaseUrl(request);

    return response.status(200).json(tvshows.map(tvshow => presentTVShow(tvshow, baseUrl)));
  }
}