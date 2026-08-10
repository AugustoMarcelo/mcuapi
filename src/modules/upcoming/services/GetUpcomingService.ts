import { injectable, inject } from 'tsyringe';
import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import IGetUpcomingDTO from '@modules/upcoming/dtos/IGetUpcomingDTO';
import IGetUpcomingResponseDTO from '@modules/upcoming/dtos/IGetUpcomingResponseDTO';
import IUpcomingItemDTO from '@modules/upcoming/dtos/IUpcomingItemDTO';

function toUpcomingItem(
  title: IMovie | ITVShow,
  type: 'movie' | 'tvshow',
): IUpcomingItemDTO {
  return {
    id: title.id,
    type,
    title: title.title,
    release_date: title.release_date as Date,
    overview: title.overview,
    cover_url: title.cover_url,
    continuity: title.continuity,
    multiverse_designation: title.multiverse_designation,
    is_mcu: title.is_mcu,
    phase: title.phase,
    saga: title.saga,
  };
}

@injectable()
class GetUpcomingService {
  constructor(
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
    @inject('TVShowsRepository')
    private tvshowsRepository: ITVShowsRepository,
  ) {}

  public async execute({
    page,
    limit,
    type,
    continuity,
    multiverse_designation,
    is_mcu,
  }: IGetUpcomingDTO): Promise<IGetUpcomingResponseDTO> {
    const { data: movies } = await this.moviesRepository.findAll({});
    const { data: tvshows } = await this.tvshowsRepository.findAll({});

    const now = Date.now();
    const isUpcoming = (title: IMovie | ITVShow): boolean =>
      !!title.release_date && new Date(title.release_date).getTime() > now;

    const items: IUpcomingItemDTO[] = [
      ...movies.filter(isUpcoming).map(movie => toUpcomingItem(movie, 'movie')),
      ...tvshows
        .filter(isUpcoming)
        .map(tvshow => toUpcomingItem(tvshow, 'tvshow')),
    ];

    const filtered = items.filter(item => {
      if (type && item.type !== type) return false;
      if (continuity && item.continuity !== continuity) return false;
      if (
        multiverse_designation &&
        item.multiverse_designation !== multiverse_designation
      )
        return false;
      if (is_mcu !== undefined && item.is_mcu !== is_mcu) return false;

      return true;
    });

    filtered.sort(
      (a, b) =>
        new Date(a.release_date).getTime() - new Date(b.release_date).getTime(),
    );

    const total = filtered.length;
    const data =
      page && limit
        ? filtered.slice((page - 1) * limit, (page - 1) * limit + limit)
        : filtered;

    return { data, total };
  }
}

export default GetUpcomingService;
