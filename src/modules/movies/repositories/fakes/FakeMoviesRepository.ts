import ICreateMovieDTO from '@modules/movies/dtos/ICreateMovieDTO';
import IFindAllMoviesDTO from '@modules/movies/dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '@modules/movies/dtos/IFindAllMoviesResponseDTO';
import IMovie from '@modules/movies/entities/IMovie';

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
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    const offset = page && limit && (page - 1) * limit;

    const filteredMovies = this.movies.slice(offset, limit);

    // if (columns) {
    //   const columnsArray = columns.split(',');
    //   let tempArray: IMovie[];

    //   filteredMovies.forEach(movie => {
    //     const newMovie = Object.keys(movie).reduce((object: IMovie, key) => {
    //       if (!columnsArray.includes(key)) {
    //         const newKey = key as keyof IMovie;
    //         object[newKey] = movie[newKey];
    //       }

    //       return object;
    //     }, {} as IMovie);

    //     tempArray.push(newMovie);
    //   });
    // }

    return { data: filteredMovies, total: this.movies.length };
  }
}

export default FakeMoviesRepository;
