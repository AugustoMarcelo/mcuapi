import { injectable, inject } from 'tsyringe';
import ITitlesRepository from '@modules/titles/repositories/ITitlesRepository';
import IGetUpcomingDTO from '@modules/upcoming/dtos/IGetUpcomingDTO';
import IGetUpcomingResponseDTO from '@modules/upcoming/dtos/IGetUpcomingResponseDTO';

@injectable()
class GetUpcomingService {
  constructor(
    @inject('TitlesRepository')
    private titlesRepository: ITitlesRepository,
  ) {}

  public async execute({
    page,
    limit,
    type,
    continuity,
    multiverse_designation,
    is_mcu,
  }: IGetUpcomingDTO): Promise<IGetUpcomingResponseDTO> {
    const { data, total } = await this.titlesRepository.findAll({
      page,
      limit,
      type,
      continuity,
      multiverse_designation,
      is_mcu,
      releaseDateAfter: new Date(),
    });

    return { data, total };
  }
}

export default GetUpcomingService;
