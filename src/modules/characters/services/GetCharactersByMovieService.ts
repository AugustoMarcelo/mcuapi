import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';

@injectable()
class GetCharactersByMovieService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(movie_id: number): Promise<any[]> {
    return this.charactersRepository.findByMovieId(movie_id);
  }
}

export default GetCharactersByMovieService; 
