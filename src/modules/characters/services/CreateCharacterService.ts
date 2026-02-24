import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';
import ICreateCharacterDTO from '../dtos/ICreateCharacterDTO';
import ICharacter from '../entities/ICharacter';

@injectable()
class CreateCharacterService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(data: ICreateCharacterDTO): Promise<ICharacter> {
    const character = await this.charactersRepository.create(data);

    return character;
  }
}

export default CreateCharacterService; 