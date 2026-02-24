import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';
import ICharacter from '../entities/ICharacter';

@injectable()
class ShowCharacterService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute({ character_id }: { character_id: number }): Promise<ICharacter | undefined> {
    const character = await this.charactersRepository.findById(character_id);

    return character;
  }
}

export default ShowCharacterService; 