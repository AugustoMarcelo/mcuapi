import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '@modules/tvshows/dtos/IFindAllTVShowsResponseDTO';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListTVShowsService {
  constructor(
    @inject('TVShowsRepository')
    private tvshowsRepository: ITVShowsRepository,
  ) {}

  public async execute(
    params?: IFindAllTVShowsDTO,
  ): Promise<IFindAllTVShowsResponseDTO> {
    const response = this.tvshowsRepository.findAll(params);

    return response;
  }
}

export default ListTVShowsService;
