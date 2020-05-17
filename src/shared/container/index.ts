import { container } from 'tsyringe';

import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import MoviesRepository from '@modules/movies/infra/typeorm/repositories/MoviesRepository';

container.registerSingleton<IMoviesRepository>(
  'MoviesRepository',
  MoviesRepository,
);
