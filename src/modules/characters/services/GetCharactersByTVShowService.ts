import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';

@injectable()
class GetCharactersByTVShowService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(tvshow_id: number): Promise<any[]> {
    return this.charactersRepository.findByTVShowId(tvshow_id);
  }
}

export default GetCharactersByTVShowService; 
