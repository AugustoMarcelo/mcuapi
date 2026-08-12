import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';
import ICharacter from '../entities/ICharacter';

@injectable()
class GetCharactersByMovieService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(
    movie_id: number,
  ): Promise<Array<ICharacter & { role_type?: string; appeared_in?: string }>> {
    return this.charactersRepository.findByMovieId(movie_id);
  }
}

export default GetCharactersByMovieService;
