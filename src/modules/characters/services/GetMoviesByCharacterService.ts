import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IMovie from '@modules/movies/entities/IMovie';
import ICharactersRepository from '../repositories/ICharactersRepository';

@injectable()
class GetMoviesByCharacterService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(character_id: number): Promise<Array<IMovie & { role_type?: string }>> {
    const character = await this.charactersRepository.findById(character_id);

    if (!character) {
      throw new AppError('Character not found', 404);
    }

    return this.charactersRepository.findMoviesByCharacterId(character_id);
  }
}

export default GetMoviesByCharacterService;
