import IMoviesRepository from '../IMoviesRepository';
import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '@modules/movies/dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '@modules/movies/dtos/IFindAllMoviesResponseDTO';
import IMovie from '@modules/movies/entities/IMovie';
import MOVIE_COLUMNS from '@modules/movies/entities/movieColumns';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';
import compareValues from '@shared/utils/compareValues';

import Movie from '@modules/movies/infra/typeorm/entities/Movie';

class FakeMoviesRepository implements IMoviesRepository {
  private movies: IMovie[] = [];

  public async create(data: ICreateMovieDTO): Promise<IMovie> {
    const movie = new Movie();

    Object.assign(movie, data);

    this.movies.push(movie);

    return movie;
  }

  public async update(movie: IMovie): Promise<IMovie> {
    const findIndex = this.movies.findIndex(
      findMovie => findMovie.id === movie.id,
    );

    this.movies[findIndex] = movie;

    return movie;
  }

  public async findById(id: number): Promise<IMovie | undefined> {
    const findMovie = this.movies.find(movie => movie.id === id);

    return findMovie;
  }

  public async findAll({
    page,
    limit,
    columns,
    order,
    filter,
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    let filteredMovies = [...this.movies];

    filter?.forEach(({ column, value }) => {
      filteredMovies = filteredMovies.filter(movie => {
        const movieValue = movie[column];

        if (movieValue === undefined || movieValue === null) {
          return false;
        }

        return MOVIE_COLUMNS[column] === 'exact'
          ? String(movieValue) === value
          : String(movieValue).toLowerCase().includes(value.toLowerCase());
      });
    });

    if (order?.length) {
      filteredMovies = [...filteredMovies].sort((a, b) => {
        const clause = order.find(
          ({ column }) => compareValues(a[column], b[column]) !== 0,
        );

        if (!clause) return 0;

        const comparison = compareValues(a[clause.column], b[clause.column]);

        return clause.direction === 'ASC' ? comparison : -comparison;
      });
    }

    const total = filteredMovies.length;

    const offset = page && limit && (page - 1) * limit;
    const end = limit === undefined ? undefined : (offset ?? 0) + limit;
    let pagedMovies = filteredMovies.slice(offset, end);

    if (columns) {
      pagedMovies = pagedMovies.map(movie => {
        const filterMovie = new Movie();

        columns.forEach(item => {
          Object.assign(filterMovie, { [item]: movie[item] });
        });

        return filterMovie;
      });
    }

    return { data: pagedMovies, total };
  }

  public async getStats(): Promise<IRepositoryStatsDTO> {
    const continuities = Array.from(
      new Set(
        this.movies
          .map(movie => movie.continuity)
          .filter((value): value is string => !!value),
      ),
    );
    const designations = Array.from(
      new Set(
        this.movies
          .map(movie => movie.multiverse_designation)
          .filter((value): value is string => !!value),
      ),
    );
    const updatedDates = this.movies
      .map(movie => movie.updated_at)
      .filter((date): date is Date => !!date);

    return {
      count: this.movies.length,
      continuities,
      designations,
      last_updated: updatedDates.length
        ? new Date(Math.max(...updatedDates.map(date => date.getTime())))
        : null,
    };
  }
}

export default FakeMoviesRepository;
