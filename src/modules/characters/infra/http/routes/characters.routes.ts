import { Router } from 'express';

import CharactersController from '../controllers/CharactersController';

const charactersRouter = Router();
const charactersController = new CharactersController();

charactersRouter.get('/', charactersController.index);
charactersRouter.get('/movie/:movie_id', charactersController.getByMovie);
charactersRouter.get('/tvshow/:tvshow_id', charactersController.getByTVShow);
charactersRouter.get('/:character_id/movies', charactersController.getMovies);
charactersRouter.get('/:character_id/tvshows', charactersController.getTVShows);
charactersRouter.get('/:character_id', charactersController.show);

export default charactersRouter;
