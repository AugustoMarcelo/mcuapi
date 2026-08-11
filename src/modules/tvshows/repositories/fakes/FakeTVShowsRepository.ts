import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '@modules/tvshows/dtos/IFindAllTVShowsResponseDTO';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import TVSHOW_COLUMNS from '@modules/tvshows/entities/tvshowColumns';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;

  return a > b ? 1 : -1;
}

class FakeTVShowsRepository implements ITVShowsRepository {
  private tvshows: ITVShow[];

  constructor(initialData: ITVShow[] = []) {
    this.tvshows = initialData;
  }

  public async findById(id: number): Promise<ITVShow | undefined> {
    const tvshow = this.tvshows.find(item => item.id === id);

    return tvshow;
  }

  public async findAll(
    data?: IFindAllTVShowsDTO,
  ): Promise<IFindAllTVShowsResponseDTO> {
    let filteredTVShows = [...this.tvshows];

    data?.filter?.forEach(({ column, value }) => {
      filteredTVShows = filteredTVShows.filter(tvshow => {
        const tvshowValue = tvshow[column];

        if (tvshowValue === undefined || tvshowValue === null) {
          return false;
        }

        return TVSHOW_COLUMNS[column] === 'exact'
          ? String(tvshowValue) === value
          : String(tvshowValue).toLowerCase().includes(value.toLowerCase());
      });
    });

    if (data?.order?.length) {
      const { order } = data;

      filteredTVShows = [...filteredTVShows].sort((a, b) => {
        const clause = order.find(
          ({ column }) => compareValues(a[column], b[column]) !== 0,
        );

        if (!clause) return 0;

        const comparison = compareValues(a[clause.column], b[clause.column]);

        return clause.direction === 'ASC' ? comparison : -comparison;
      });
    }

    const total = filteredTVShows.length;

    let pagedTVShows = filteredTVShows;

    if (data && data.page && data.limit) {
      const { page, limit } = data;
      const offset = (page - 1) * limit;

      pagedTVShows = pagedTVShows.slice(offset, limit);
    }

    if (data && data.columns) {
      const { columns } = data;

      pagedTVShows = pagedTVShows.map(tvshow => {
        const filterTVShow = new TVShow();

        columns.forEach(item => {
          Object.assign(filterTVShow, { [item]: tvshow[item] });
        });

        return filterTVShow;
      });
    }

    return {
      data: pagedTVShows,
      total,
    };
  }

  public async getStats(): Promise<IRepositoryStatsDTO> {
    const continuities = Array.from(
      new Set(
        this.tvshows
          .map(tvshow => tvshow.continuity)
          .filter((value): value is string => !!value),
      ),
    );
    const designations = Array.from(
      new Set(
        this.tvshows
          .map(tvshow => tvshow.multiverse_designation)
          .filter((value): value is string => !!value),
      ),
    );
    const updatedDates = this.tvshows
      .map(tvshow => tvshow.updated_at)
      .filter((date): date is Date => !!date);

    return {
      count: this.tvshows.length,
      continuities,
      designations,
      last_updated: updatedDates.length
        ? new Date(Math.max(...updatedDates.map(date => date.getTime())))
        : null,
    };
  }
}

export default FakeTVShowsRepository;
