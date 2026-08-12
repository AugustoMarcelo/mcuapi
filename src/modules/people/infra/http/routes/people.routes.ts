import { Router } from 'express';

import PeopleController from '../controllers/PeopleController';

const peopleRouter = Router();
const peopleController = new PeopleController();

peopleRouter.get('/', peopleController.index);
peopleRouter.get('/:person_id/characters', peopleController.getCharacters);
peopleRouter.get('/:person_id/titles', peopleController.getTitles);
peopleRouter.get('/:person_id', peopleController.show);

export default peopleRouter;
