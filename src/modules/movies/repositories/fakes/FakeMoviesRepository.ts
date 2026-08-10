import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '@modules/movies/dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '@modules/movies/dtos/IFindAllMoviesResponseDTO';
import IMovie from '@modules/movies/entities/IMovie';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';

import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import IMoviesRepository from '../IMoviesRepository';

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
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    const offset = page && limit && (page - 1) * limit;

    let filteredMovies = this.movies.slice(offset, limit);

    if (columns) {
      const columnsArray = columns.split(',') as (keyof IMovie)[];

      filteredMovies = filteredMovies.map(movie => {
        const filterMovie = new Movie();

        columnsArray.forEach(item => {
          Object.assign(filterMovie, { [item]: movie[item] });
        });

        return filterMovie;
      });
    }

    return { data: filteredMovies, total: this.movies.length };
  }

  public async getStats(): Promise<IRepositoryStatsDTO> {
    const continuities = Array.from(
      new Set(this.movies.map(movie => movie.continuity).filter((value): value is string => !!value)),
    );
    const designations = Array.from(
      new Set(this.movies.map(movie => movie.multiverse_designation).filter((value): value is string => !!value)),
    );
    const updatedDates = this.movies.map(movie => movie.updated_at).filter((date): date is Date => !!date);

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
