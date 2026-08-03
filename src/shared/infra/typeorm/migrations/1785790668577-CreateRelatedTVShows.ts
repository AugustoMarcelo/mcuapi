import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateRelatedTVShows1785790668577
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'related_tvshows',
        columns: [
          {
            name: 'tvshow_id',
            type: 'int',
          },
          {
            name: 'related_tvshow_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'related_tvshows',
      new TableForeignKey({
        name: 'FKTVShowId',
        referencedTableName: 'tvshows',
        referencedColumnNames: ['id'],
        columnNames: ['tvshow_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'related_tvshows',
      new TableForeignKey({
        name: 'FKRelatedTVShowId',
        referencedTableName: 'tvshows',
        referencedColumnNames: ['id'],
        columnNames: ['related_tvshow_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('related_tvshows', 'FKTVShowId');
    await queryRunner.dropForeignKey('related_tvshows', 'FKRelatedTVShowId');
    await queryRunner.dropTable('related_tvshows');
  }
}
