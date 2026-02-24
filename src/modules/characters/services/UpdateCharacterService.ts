import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import ICharactersRepository from '../repositories/ICharactersRepository';
import IUpdateCharacterDTO from '../dtos/IUpdateCharacterDTO';
import ICharacter from '../entities/ICharacter';

@injectable()
class UpdateCharacterService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute({
    character_id,
    ...data
  }: IUpdateCharacterDTO): Promise<ICharacter> {
    const character = await this.charactersRepository.findById(character_id);

    if (!character) {
      throw new AppError('Character not found');
    }

    const updatedCharacter = await this.charactersRepository.update({
      ...character,
      ...data,
    });

    return updatedCharacter;
  }
}

export default UpdateCharacterService; 
