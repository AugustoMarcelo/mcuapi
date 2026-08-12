export default interface ICharacterAppearance {
  id?: number;
  character_id: number;
  movie_id?: number;
  tvshow_id?: number;
  role_type?: string;
  /**
   * Reality the character was in for this title. Null means the same as the
   * title itself — only set it when they are somewhere else, e.g. the Void.
   */
  multiverse_designation?: string;
  created_at?: Date;
}
