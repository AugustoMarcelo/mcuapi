import { Router } from 'express';

import CharactersController from '../controllers/CharactersController';
import { ensureApiKey } from '@shared/infra/http/middlewares/ensureApiKey';

const charactersRouter = Router();
const charactersController = new CharactersController();

charactersRouter.get('/', charactersController.index);
charactersRouter.get('/movie/:movie_id', charactersController.getByMovie);
charactersRouter.get('/tvshow/:tvshow_id', charactersController.getByTVShow);
charactersRouter.get('/:character_id', charactersController.show);
charactersRouter.post('/', ensureApiKey, charactersController.create);
charactersRouter.put('/:character_id', ensureApiKey, charactersController.update);
charactersRouter.delete('/:character_id', ensureApiKey, charactersController.delete);

export default charactersRouter; 
