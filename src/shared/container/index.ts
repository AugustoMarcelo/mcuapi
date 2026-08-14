import { container } from 'tsyringe';

import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import MoviesRepository from '@modules/movies/infra/typeorm/repositories/MoviesRepository';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import TVShowsRepository from '@modules/tvshows/infra/typeorm/repositories/TVShowsRepository';
import ICharactersRepository from '@modules/characters/repositories/ICharactersRepository';
import CharactersRepository from '@modules/characters/infra/typeorm/repositories/CharactersRepository';
import IPeopleRepository from '@modules/people/repositories/IPeopleRepository';
import PeopleRepository from '@modules/people/infra/typeorm/repositories/PeopleRepository';
import IPostCreditScenesRepository from '@modules/postCreditScenes/repositories/IPostCreditScenesRepository';
import PostCreditScenesRepository from '@modules/postCreditScenes/infra/typeorm/repositories/PostCreditScenesRepository';

container.registerSingleton<IMoviesRepository>(
  'MoviesRepository',
  MoviesRepository,
);

container.registerSingleton<ITVShowsRepository>(
  'TVShowsRepository',
  TVShowsRepository,
);

container.registerSingleton<ICharactersRepository>(
  'CharactersRepository',
  CharactersRepository,
);

container.registerSingleton<IPeopleRepository>(
  'PeopleRepository',
  PeopleRepository,
);

container.registerSingleton<IPostCreditScenesRepository>(
  'PostCreditScenesRepository',
  PostCreditScenesRepository,
);
