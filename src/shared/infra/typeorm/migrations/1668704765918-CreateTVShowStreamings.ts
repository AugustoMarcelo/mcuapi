import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateTVShowStreamings1668704765918
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tvshow_streamings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'tvshow_id',
            type: 'int',
          },
          {
            name: 'platform',
            type: 'varchar',
          },
          {
            name: 'url',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'tvshow_streamings',
      new TableForeignKey({
        name: 'FKTVShowIdStreaming',
        referencedTableName: 'tvshows',
        referencedColumnNames: ['id'],
        columnNames: ['tvshow_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tvshow_streamings');
  }
}
