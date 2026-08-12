import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';
import ICharacter from '../entities/ICharacter';

@injectable()
class GetCharactersByTVShowService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(
    tvshow_id: number,
  ): Promise<Array<ICharacter & { role_type?: string; appeared_in?: string }>> {
    return this.charactersRepository.findByTVShowId(tvshow_id);
  }
}

export default GetCharactersByTVShowService;
