import IPostCreditScene from './IPostCreditScene';
import { ColumnAllowList } from '@shared/infra/http/listParams';

export type PostCreditSceneColumn = keyof IPostCreditScene;

const POST_CREDIT_SCENE_COLUMNS: ColumnAllowList<PostCreditSceneColumn> = {
  id: 'exact',
  movie_id: 'exact',
  tvshow_id: 'exact',
  description: 'text',
  teases_movie_id: 'exact',
  teases_tvshow_id: 'exact',
  is_stinger: 'exact',
  created_at: 'exact',
  updated_at: 'exact',
};

export default POST_CREDIT_SCENE_COLUMNS;
