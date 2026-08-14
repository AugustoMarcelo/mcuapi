export default interface IPostCreditScene {
  id: number;

  movie_id?: number;

  tvshow_id?: number;

  description: string;

  teases_movie_id?: number;

  teases_tvshow_id?: number;

  /** true = mid-credits scene, false = final post-credits scene */
  is_stinger: boolean;

  created_at?: Date;

  updated_at?: Date;
}
