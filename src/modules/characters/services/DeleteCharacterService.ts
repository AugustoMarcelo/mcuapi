import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ICharactersRepository from '../repositories/ICharactersRepository';

@injectable()
class DeleteCharacterService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(character_id: number): Promise<void> {
    const character = await this.charactersRepository.findById(character_id);

    if (!character) {
      throw new AppError('Character not found', 404);
    }

    await this.charactersRepository.delete(character_id);
  }
}

export default DeleteCharacterService;
