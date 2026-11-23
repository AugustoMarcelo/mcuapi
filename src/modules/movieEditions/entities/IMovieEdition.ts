export interface IMovieEditionRelease {
  id: number;
  channel: string;
  release_date: Date;
}

export interface IMovieEditionTeasedMovie {
  id: number;
  title: string;
}

export default interface IMovieEdition {
  id: number;
  movie_id: number;
  title: string;
  description?: string;
  releases: IMovieEditionRelease[];
  teased_movies: IMovieEditionTeasedMovie[];
  created_at?: Date;
  updated_at?: Date;
}
