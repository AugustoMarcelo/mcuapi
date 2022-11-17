import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateMovieStreamings1665599256883
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'movie_streamings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'movie_id',
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
      'movie_streamings',
      new TableForeignKey({
        name: 'FKMovieIdStreaming',
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        columnNames: ['movie_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('movie_streamings', 'FKMovieIdStreaming');
    await queryRunner.dropTable('movie_streamings');
  }
}
