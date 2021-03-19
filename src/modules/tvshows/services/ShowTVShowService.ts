import { inject, injectable } from 'tsyringe';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import AppError from '@shared/errors/AppError';

interface IParams {
  tvshow_id: number;
}

@injectable()
class ShowTVShowService {
  constructor(
    @inject('TVShowsRepository')
    private tvshowsRepository: ITVShowsRepository,
  ) {}

  public async execute({ tvshow_id }: IParams): Promise<ITVShow> {
    const tvshow = await this.tvshowsRepository.findById(tvshow_id);

    if (!tvshow) {
      throw new AppError('TV Show not found', 404);
    }

    return tvshow;
  }
}

export default ShowTVShowService;
