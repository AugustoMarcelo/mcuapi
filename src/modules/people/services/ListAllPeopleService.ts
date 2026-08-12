import { injectable, inject } from 'tsyringe';
import IPeopleRepository from '../repositories/IPeopleRepository';
import IFindAllPeopleDTO from '../dtos/IFindAllPeopleDTO';
import IFindAllPeopleResponseDTO from '../dtos/IFindAllPeopleResponseDTO';

@injectable()
class ListAllPeopleService {
  constructor(
    @inject('PeopleRepository')
    private peopleRepository: IPeopleRepository,
  ) {}

  public async execute(
    data: IFindAllPeopleDTO,
  ): Promise<IFindAllPeopleResponseDTO> {
    const { data: people, total } = await this.peopleRepository.findAll(data);

    return { data: people, total };
  }
}

export default ListAllPeopleService;
