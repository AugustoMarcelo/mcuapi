import { injectable, inject } from 'tsyringe';
import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import ICharactersRepository from '@modules/characters/repositories/ICharactersRepository';
import IStatsResponseDTO from '@modules/stats/dtos/IStatsResponseDTO';

function distinctCount(...lists: Array<string[] | undefined>): number {
  return new Set(lists.flat().filter((value): value is string => !!value)).size;
}

function maxDate(...dates: Array<Date | null>): Date | null {
  const timestamps = dates.filter((date): date is Date => date != null);

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps.map(date => date.getTime())));
}

@injectable()
class GetStatsService {
  constructor(
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
    @inject('TVShowsRepository')
    private tvshowsRepository: ITVShowsRepository,
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
  ) {}

  public async execute(): Promise<IStatsResponseDTO> {
    const [movies, tvshows, characters] = await Promise.all([
      this.moviesRepository.getStats(),
      this.tvshowsRepository.getStats(),
      this.charactersRepository.getStats(),
    ]);

    return {
      movies: movies.count,
      tvshows: tvshows.count,
      characters: characters.count,
      titles: movies.count + tvshows.count,
      continuities: distinctCount(movies.continuities, tvshows.continuities),
      designations: distinctCount(
        movies.designations,
        tvshows.designations,
        characters.designations,
      ),
      last_updated: maxDate(
        movies.last_updated,
        tvshows.last_updated,
        characters.last_updated,
      ),
    };
  }
}

export default GetStatsService;
