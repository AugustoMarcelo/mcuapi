import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * `movies.post_credit_scenes` has existed since the initial schema, but
 * `tvshows` never got the matching column — the CreatePostCreditScenes
 * migration's sync logic needs both to exist symmetrically.
 */
export default class AddPostCreditScenesToTVShows1786708677430 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tvshows',
      new TableColumn({
        name: 'post_credit_scenes',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tvshows', 'post_credit_scenes');
  }
}
