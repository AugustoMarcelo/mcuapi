import { Router } from 'express';

import CharactersController from '../controllers/CharactersController';

const charactersRouter = Router();
const charactersController = new CharactersController();

charactersRouter.get('/', charactersController.index);
charactersRouter.get('/movie/:movie_id', charactersController.getByMovie);
charactersRouter.get('/tvshow/:tvshow_id', charactersController.getByTVShow);
charactersRouter.get('/:character_id', charactersController.show);
charactersRouter.post('/', charactersController.create);
charactersRouter.put('/:character_id', charactersController.update);

export default charactersRouter; 
