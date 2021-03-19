import IFindAllTVShowsDTO from '@modules/tvshows/dtos/IFindAllTVShowsDTO';
import IFindAllTVShowsResponseDTO from '@modules/tvshows/dtos/IFindAllTVShowsResponseDTO';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';

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
    let filteredTVShows = this.tvshows;

    if (data && data.page && data.limit) {
      const { page, limit } = data;
      const offset = (page - 1) * limit;

      filteredTVShows = filteredTVShows.slice(offset, limit);
    }

    if (data && data.filter) {
      const { filter } = data;
      const [column, value] = filter.split('=') as [keyof ITVShow, string];

      filteredTVShows = filteredTVShows.filter(item =>
        item[column]?.toString().includes(value),
      );
    }

    if (data && data.columns) {
      const columnsArray = data.columns.split(',') as (keyof ITVShow)[];

      filteredTVShows = filteredTVShows.map(tvshow => {
        const filterTVShow = new TVShow();

        columnsArray.forEach(item => {
          Object.assign(filterTVShow, { [item]: tvshow[item] });
        });

        return filterTVShow;
      });
    }

    return {
      data: filteredTVShows,
      total: filteredTVShows.length,
    };
  }
}

export default FakeTVShowsRepository;
