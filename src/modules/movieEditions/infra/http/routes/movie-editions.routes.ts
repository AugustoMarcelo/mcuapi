import { Router } from 'express';
import MovieEditionsController from '../controllers/MovieEditionsController';
import {
  validateListQuery,
  validatePositiveIntegerParam,
  validateQuery,
} from '@shared/infra/http/requestValidation';

const router = Router();
const controller = new MovieEditionsController();

router.get('/', validateListQuery({ fields: ['movie_id'] }), controller.index);
router.get(
  '/:movie_edition_id',
  validatePositiveIntegerParam('movie_edition_id'),
  validateQuery(),
  controller.show,
);

export default router;
