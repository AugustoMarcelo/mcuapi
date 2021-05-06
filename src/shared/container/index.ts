import { container } from 'tsyringe';

import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import MoviesRepository from '@modules/movies/infra/typeorm/repositories/MoviesRepository';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import TVShowsRepository from '@modules/tvshows/infra/typeorm/repositories/TVShowsRepository';

container.registerSingleton<IMoviesRepository>(
  'MoviesRepository',
  MoviesRepository,
);

container.registerSingleton<ITVShowsRepository>(
  'TVShowsRepository',
  TVShowsRepository,
);
