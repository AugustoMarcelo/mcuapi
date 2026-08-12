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

interface IInternalTimelineEntry extends ITimelineEntry {
  continuity: string;
  multiverse_designation: string;
  release_date?: Date;
}

function compareTimelineEntries(
  a: IInternalTimelineEntry,
  b: IInternalTimelineEntry,
): number {
  const aHasOrder = a.chronology_order > 0;
  const bHasOrder = b.chronology_order > 0;

  if (aHasOrder && bHasOrder) {
    return a.chronology_order - b.chronology_order;
  }
  if (aHasOrder !== bHasOrder) {
    return aHasOrder ? -1 : 1;
  }

  const aDate = a.release_date ? new Date(a.release_date).getTime() : null;
  const bDate = b.release_date ? new Date(b.release_date).getTime() : null;

  if (aDate != null && bDate != null) {
    return aDate - bDate;
  }
  if ((aDate != null) !== (bDate != null)) {
    return aDate != null ? -1 : 1;
  }

  return 0;
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
      columns: [
        'id',
        'title',
        'continuity',
        'multiverse_designation',
        'timeline_chronology_order',
        'release_date',
        'type',
      ],
      order: [{ column: 'timeline_chronology_order', direction: 'ASC' }],
    });

    const { data: tvshows } = await this.tvshowsRepository.findAll({
      columns: [
        'id',
        'title',
        'continuity',
        'multiverse_designation',
        'timeline_chronology_order',
        'release_date',
        'type',
      ],
      order: [{ column: 'timeline_chronology_order', direction: 'ASC' }],
    });

    // Combine and filter by multiverse if specified
    const allEntries: IInternalTimelineEntry[] = [
      ...movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        chronology_order: movie.timeline_chronology_order || 0,
        type: movie.type || 'movie',
        continuity: movie.continuity || 'MCU',
        multiverse_designation: movie.multiverse_designation || 'Earth-616',
        release_date: movie.release_date,
      })),
      ...tvshows.map(tvshow => ({
        id: tvshow.id,
        title: tvshow.title,
        chronology_order: tvshow.timeline_chronology_order || 0,
        type: tvshow.type || 'tvshow',
        continuity: tvshow.continuity || 'MCU',
        multiverse_designation: tvshow.multiverse_designation || 'Earth-616',
        release_date: tvshow.release_date,
      })),
    ];

    const filteredEntries = multiverse
      ? allEntries.filter(entry => entry.multiverse_designation === multiverse)
      : allEntries;

    // Group by continuity and multiverse designation
    const timelineMap = new Map<
      string,
      {
        continuity: string;
        multiverse_designation: string;
        entries: IInternalTimelineEntry[];
      }
    >();

    filteredEntries.forEach(entry => {
      const key = `${entry.continuity}-${entry.multiverse_designation}`;

      if (!timelineMap.has(key)) {
        timelineMap.set(key, {
          continuity: entry.continuity,
          multiverse_designation: entry.multiverse_designation,
          entries: [],
        });
      }

      timelineMap.get(key)!.entries.push(entry);
    });

    // Sort entries within each continuity: real chronology_order first (by
    // value), then entries without one ordered by release_date, then
    // entries with neither, last — stable relative to each other.
    timelineMap.forEach(continuity => {
      continuity.entries.sort(compareTimelineEntries);
    });

    return Array.from(timelineMap.values()).map(continuity => ({
      continuity: continuity.continuity,
      multiverse_designation: continuity.multiverse_designation,
      entries: continuity.entries.map(
        ({ id, title, chronology_order, type }) => ({
          id,
          title,
          chronology_order,
          type,
        }),
      ),
    }));
  }
}

export default GetTimelineService;
