import { FilterClause, OrderClause } from '@shared/infra/http/listParams';
import { PostCreditSceneColumn } from '@modules/postCreditScenes/entities/postCreditSceneColumns';

export default interface IFindAllPostCreditScenesDTO {
  page?: number;
  limit?: number;
  columns?: PostCreditSceneColumn[];
  order?: OrderClause<PostCreditSceneColumn>[];
  filter?: FilterClause<PostCreditSceneColumn>[];
}
