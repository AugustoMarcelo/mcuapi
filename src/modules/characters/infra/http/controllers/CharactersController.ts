import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListAllCharactersService from '@modules/characters/services/ListAllCharactersService';
import ShowCharacterService from '@modules/characters/services/ShowCharacterService';
import GetCharactersByMovieService from '@modules/characters/services/GetCharactersByMovieService';
import GetCharactersByTVShowService from '@modules/characters/services/GetCharactersByTVShowService';

interface IRequestQuery {
  page?: number;
  limit?: number;
  columns?: string;
  order?: string;
  filter?: string;
  continuity?: string;
  multiverse_designation?: string;
}

export default class CharactersController {
  public async index(request: Request, response: Response): Promise<Response> {
    const {
      page,
      limit,
      columns,
      order,
      filter,
      continuity,
      multiverse_designation,
    }: IRequestQuery = request.query;

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

    return response.status(200).json({ data, total });
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { character_id } = request.params;

    const showCharacter = container.resolve(ShowCharacterService);

    const character = await showCharacter.execute({ character_id: Number(character_id) });

    return response.status(200).json(character);
  }

  public async getByMovie(request: Request, response: Response): Promise<Response> {
    const { movie_id } = request.params;

    const getCharactersByMovie = container.resolve(GetCharactersByMovieService);
    const characters = await getCharactersByMovie.execute(Number(movie_id));

    return response.status(200).json(characters);
  }

  public async getByTVShow(request: Request, response: Response): Promise<Response> {
    const { tvshow_id } = request.params;

    const getCharactersByTVShow = container.resolve(GetCharactersByTVShowService);
    const characters = await getCharactersByTVShow.execute(Number(tvshow_id));

    return response.status(200).json(characters);
  }
}