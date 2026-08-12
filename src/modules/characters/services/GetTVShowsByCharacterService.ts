import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';
import AppError from '@shared/errors/AppError';
import ITVShow from '@modules/tvshows/entities/ITVShow';

@injectable()
class GetTVShowsByCharacterService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(
    character_id: number,
  ): Promise<Array<ITVShow & { role_type?: string }>> {
    const character = await this.charactersRepository.findById(character_id);

    if (!character) {
      throw new AppError('Character not found', 404);
    }

    return this.charactersRepository.findTVShowsByCharacterId(character_id);
  }
}

export default GetTVShowsByCharacterService;
