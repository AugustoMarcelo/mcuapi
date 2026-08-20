import { injectable, inject } from 'tsyringe';
import ITitlesRepository from '../repositories/ITitlesRepository';
import IFindAllTitlesDTO from '../dtos/IFindAllTitlesDTO';
import IFindAllTitlesResponseDTO from '../dtos/IFindAllTitlesResponseDTO';

@injectable()
class ListAllTitlesService {
  constructor(
    @inject('TitlesRepository')
    private titlesRepository: ITitlesRepository,
  ) {}

  public async execute(
    data: IFindAllTitlesDTO,
  ): Promise<IFindAllTitlesResponseDTO> {
    const { data: titles, total } = await this.titlesRepository.findAll(data);

    return { data: titles, total };
  }
}

export default ListAllTitlesService;
