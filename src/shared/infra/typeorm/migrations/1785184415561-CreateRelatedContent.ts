import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateRelatedContent1785184415561
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'related_content',
        columns: [
          {
            name: 'movie_id',
            type: 'int',
          },
          {
            name: 'tvshow_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'related_content',
      new TableForeignKey({
        name: 'FKRelatedContentMovieId',
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        columnNames: ['movie_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'related_content',
      new TableForeignKey({
        name: 'FKRelatedContentTVShowId',
        referencedTableName: 'tvshows',
        referencedColumnNames: ['id'],
        columnNames: ['tvshow_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('related_content', 'FKRelatedContentMovieId');
    await queryRunner.dropForeignKey('related_content', 'FKRelatedContentTVShowId');
    await queryRunner.dropTable('related_content');
  }
}
