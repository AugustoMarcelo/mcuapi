import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
} from 'typeorm';

export default class CreatePostCreditScenes1786706957878 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_credit_scenes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'movie_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'tvshow_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'teases_movie_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'teases_tvshow_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_stinger',
            type: 'boolean',
            default: false,
            comment:
              'true = mid-credits scene, false = final post-credits scene',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'post_credit_scenes',
      new TableForeignKey({
        name: 'PostCreditSceneMovie',
        columnNames: ['movie_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'movies',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_credit_scenes',
      new TableForeignKey({
        name: 'PostCreditSceneTVShow',
        columnNames: ['tvshow_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tvshows',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_credit_scenes',
      new TableForeignKey({
        name: 'PostCreditSceneTeasesMovie',
        columnNames: ['teases_movie_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'movies',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_credit_scenes',
      new TableForeignKey({
        name: 'PostCreditSceneTeasesTVShow',
        columnNames: ['teases_tvshow_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tvshows',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createCheckConstraint(
      'post_credit_scenes',
      new TableCheck({
        name: 'PostCreditSceneExactlyOneHost',
        columnNames: ['movie_id', 'tvshow_id'],
        expression: 'num_nonnulls(movie_id, tvshow_id) = 1',
      }),
    );

    await queryRunner.createCheckConstraint(
      'post_credit_scenes',
      new TableCheck({
        name: 'PostCreditSceneAtMostOneTease',
        columnNames: ['teases_movie_id', 'teases_tvshow_id'],
        expression: 'num_nonnulls(teases_movie_id, teases_tvshow_id) <= 1',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropCheckConstraint(
      'post_credit_scenes',
      'PostCreditSceneAtMostOneTease',
    );
    await queryRunner.dropCheckConstraint(
      'post_credit_scenes',
      'PostCreditSceneExactlyOneHost',
    );
    await queryRunner.dropForeignKey(
      'post_credit_scenes',
      'PostCreditSceneTeasesTVShow',
    );
    await queryRunner.dropForeignKey(
      'post_credit_scenes',
      'PostCreditSceneTeasesMovie',
    );
    await queryRunner.dropForeignKey(
      'post_credit_scenes',
      'PostCreditSceneTVShow',
    );
    await queryRunner.dropForeignKey(
      'post_credit_scenes',
      'PostCreditSceneMovie',
    );
    await queryRunner.dropTable('post_credit_scenes');
  }
}
