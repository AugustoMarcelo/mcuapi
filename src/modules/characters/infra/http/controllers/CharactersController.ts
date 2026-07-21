import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateCharacterService from '@modules/characters/services/CreateCharacterService';
import UpdateCharacterService from '@modules/characters/services/UpdateCharacterService';
import ListAllCharactersService from '@modules/characters/services/ListAllCharactersService';
import ShowCharacterService from '@modules/characters/services/ShowCharacterService';
import GetCharactersByMovieService from '@modules/characters/services/GetCharactersByMovieService';
import GetCharactersByTVShowService from '@modules/characters/services/GetCharactersByTVShowService';
import DeleteCharacterService from '@modules/characters/services/DeleteCharacterService';

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

  public async create(request: Request, response: Response): Promise<Response> {
    const createCharacter = container.resolve(CreateCharacterService);

    const character = await createCharacter.execute(request.body);

    return response.json(character);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateCharacter = container.resolve(UpdateCharacterService);

    const { character_id } = request.params;

    const updatedCharacter = await updateCharacter.execute({
      character_id: Number(character_id),
      ...request.body,
    });

    return response.json(updatedCharacter);
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

  public async delete(request: Request, response: Response): Promise<Response> {
    const { character_id } = request.params;

    const deleteCharacter = container.resolve(DeleteCharacterService);
    await deleteCharacter.execute(Number(character_id));

    return response.status(204).send();
  }
} 