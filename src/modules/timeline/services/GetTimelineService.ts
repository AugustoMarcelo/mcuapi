import { injectable, inject } from 'tsyringe';
import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';

interface ITimelineEntry {
  id: number;
  title: string;
  chronology_order: number;
  type: string;
}

interface ITimelineContinuity {
  continuity: string;
  multiverse_designation: string;
  entries: ITimelineEntry[];
}

@injectable()
class GetTimelineService {
  constructor(
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
    @inject('TVShowsRepository')
    private tvshowsRepository: ITVShowsRepository,
  ) {}

  public async execute(multiverse?: string): Promise<ITimelineContinuity[]> {
    // Get all movies and TV shows with timeline data
    const { data: movies } = await this.moviesRepository.findAll({
      columns: 'id,title,continuity,multiverse_designation,timeline_chronology_order,type',
      order: 'timeline_chronology_order,ASC',
    });

    const { data: tvshows } = await this.tvshowsRepository.findAll({
      columns: 'id,title,continuity,multiverse_designation,timeline_chronology_order,type',
      order: 'timeline_chronology_order,ASC',
    });

    // Combine and filter by multiverse if specified
    const allEntries = [
      ...movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        chronology_order: movie.timeline_chronology_order || 0,
        type: movie.type || 'movie',
        continuity: movie.continuity || 'MCU',
        multiverse_designation: movie.multiverse_designation || 'Earth-616',
      })),
      ...tvshows.map(tvshow => ({
        id: tvshow.id,
        title: tvshow.title,
        chronology_order: tvshow.timeline_chronology_order || 0,
        type: tvshow.type || 'tvshow',
        continuity: tvshow.continuity || 'MCU',
        multiverse_designation: tvshow.multiverse_designation || 'Earth-616',
      })),
    ];

    // Filter by multiverse if specified
    const filteredEntries = multiverse
      ? allEntries.filter(entry => entry.multiverse_designation === multiverse)
      : allEntries;

    // Group by continuity and multiverse designation
    const timelineMap = new Map<string, ITimelineContinuity>();

    filteredEntries.forEach(entry => {
      const key = `${entry.continuity}-${entry.multiverse_designation}`;
      
      if (!timelineMap.has(key)) {
        timelineMap.set(key, {
          continuity: entry.continuity,
          multiverse_designation: entry.multiverse_designation,
          entries: [],
        });
      }

      timelineMap.get(key)!.entries.push({
        id: entry.id,
        title: entry.title,
        chronology_order: entry.chronology_order,
        type: entry.type,
      });
    });

    // Sort entries within each continuity by chronology order
    timelineMap.forEach(continuity => {
      continuity.entries.sort((a, b) => a.chronology_order - b.chronology_order);
    });

    return Array.from(timelineMap.values());
  }
}

export default GetTimelineService; 