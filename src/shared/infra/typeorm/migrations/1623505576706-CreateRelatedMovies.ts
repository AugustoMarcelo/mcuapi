import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateRelatedMovies1623505576706
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'related_movies',
        columns: [
          {
            name: 'movie_id',
            type: 'int',
          },
          {
            name: 'related_movie_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'related_movies',
      new TableForeignKey({
        name: 'FKMovieId',
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        columnNames: ['movie_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'related_movies',
      new TableForeignKey({
        name: 'FKRelatedMovieId',
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        columnNames: ['related_movie_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('related_movies', 'FKMovieId');
    await queryRunner.dropForeignKey('related_movies', 'FKMovieId');
    await queryRunner.dropTable('related_movie');
  }
}
