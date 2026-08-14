import { injectable, inject } from 'tsyringe';
import IPostCreditScenesRepository from '../repositories/IPostCreditScenesRepository';
import IFindAllPostCreditScenesDTO from '../dtos/IFindAllPostCreditScenesDTO';
import IFindAllPostCreditScenesResponseDTO from '../dtos/IFindAllPostCreditScenesResponseDTO';

@injectable()
class ListAllPostCreditScenesService {
  constructor(
    @inject('PostCreditScenesRepository')
    private postCreditScenesRepository: IPostCreditScenesRepository,
  ) {}

  public async execute(
    data: IFindAllPostCreditScenesDTO,
  ): Promise<IFindAllPostCreditScenesResponseDTO> {
    const { data: postCreditScenes, total } =
      await this.postCreditScenesRepository.findAll(data);

    return { data: postCreditScenes, total };
  }
}

export default ListAllPostCreditScenesService;
