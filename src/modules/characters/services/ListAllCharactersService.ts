import { injectable, inject } from 'tsyringe';
import ICharactersRepository from '../repositories/ICharactersRepository';
import IFindAllCharactersDTO from '../dtos/IFindAllCharactersDTO';
import IFindAllCharactersResponseDTO from '../dtos/IFindAllCharactersResponseDTO';

@injectable()
class ListAllCharactersService {
  constructor(
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(data: IFindAllCharactersDTO): Promise<IFindAllCharactersResponseDTO> {
    const { data: characters, total } = await this.charactersRepository.findAll(data);

    return { data: characters, total };
  }
}

export default ListAllCharactersService; 