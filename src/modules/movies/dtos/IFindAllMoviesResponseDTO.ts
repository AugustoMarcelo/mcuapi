import IMovie from '../entities/IMovie';

export default interface IFindAllMoviesResponse {
  data: IMovie[];
  total: number;
}
