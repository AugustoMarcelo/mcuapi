import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ICharactersRepository from '../repositories/ICharactersRepository';
import ICharacter from '../entities/ICharacter';

@injectable()
class ShowCharacterService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute({ character_id }: { character_id: number }): Promise<ICharacter> {
    const character = await this.charactersRepository.findById(character_id);

    if (!character) {
      throw new AppError('Character not found', 404);
    }

    return character;
  }
}

export default ShowCharacterService; 