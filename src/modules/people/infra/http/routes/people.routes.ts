import { Router } from 'express';

import PeopleController from '../controllers/PeopleController';
import PEOPLE_COLUMNS from '@modules/people/entities/peopleColumns';
import {
  validateListQuery,
  validatePositiveIntegerParam,
  validateQuery,
} from '@shared/infra/http/requestValidation';

const peopleRouter = Router();
const peopleController = new PeopleController();

peopleRouter.get(
  '/',
  validateListQuery({ allowList: PEOPLE_COLUMNS }),
  peopleController.index,
);
peopleRouter.get(
  '/:person_id/characters',
  validatePositiveIntegerParam('person_id'),
  validateQuery(),
  peopleController.getCharacters,
);
peopleRouter.get(
  '/:person_id/titles',
  validatePositiveIntegerParam('person_id'),
  validateQuery(),
  peopleController.getTitles,
);
peopleRouter.get(
  '/:person_id',
  validatePositiveIntegerParam('person_id'),
  validateQuery(),
  peopleController.show,
);

export default peopleRouter;
