import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export default class CreateMovieEditions1788000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'movie_editions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'movie_id', type: 'int' },
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'movie_editions',
      new TableForeignKey({
        name: 'MovieEditionMovie',
        columnNames: ['movie_id'],
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createIndex(
      'movie_editions',
      new TableIndex({
        name: 'IDXMovieEditionMovie',
        columnNames: ['movie_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'movie_edition_releases',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'edition_id', type: 'int' },
          { name: 'channel', type: 'varchar' },
          { name: 'release_date', type: 'date' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        uniques: [
          {
            name: 'UQMovieEditionRelease',
            columnNames: ['edition_id', 'channel', 'release_date'],
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'movie_edition_releases',
      new TableForeignKey({
        name: 'MovieEditionReleaseEdition',
        columnNames: ['edition_id'],
        referencedTableName: 'movie_editions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'movie_edition_teases',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'edition_id', type: 'int' },
          { name: 'movie_id', type: 'int' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        uniques: [
          {
            name: 'UQMovieEditionTease',
            columnNames: ['edition_id', 'movie_id'],
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'movie_edition_teases',
      new TableForeignKey({
        name: 'MovieEditionTeaseEdition',
        columnNames: ['edition_id'],
        referencedTableName: 'movie_editions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'movie_edition_teases',
      new TableForeignKey({
        name: 'MovieEditionTeaseMovie',
        columnNames: ['movie_id'],
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.query(`
      INSERT INTO movie_editions (movie_id, title, description)
      SELECT source.id, 'Avengers: Endgame: Encore', 'An updated theatrical cut with new footage connecting Avengers: Endgame to Avengers: Doomsday.'
      FROM movies source
      WHERE source.title = 'Avengers: Endgame'
        AND NOT EXISTS (SELECT 1 FROM movie_editions WHERE title = 'Avengers: Endgame: Encore')
    `);
    await queryRunner.query(`
      INSERT INTO movie_edition_releases (edition_id, channel, release_date)
      SELECT id, 'theatrical', '2026-09-25' FROM movie_editions WHERE title = 'Avengers: Endgame: Encore'
      ON CONFLICT (edition_id, channel, release_date) DO NOTHING
    `);
    await queryRunner.query(`
      INSERT INTO movie_edition_releases (edition_id, channel, release_date)
      SELECT id, 'streaming', '2026-11-13' FROM movie_editions WHERE title = 'Avengers: Endgame: Encore'
      ON CONFLICT (edition_id, channel, release_date) DO NOTHING
    `);
    await queryRunner.query(`
      INSERT INTO movie_edition_teases (edition_id, movie_id)
      SELECT edition.id, teased.id
      FROM movie_editions edition
      CROSS JOIN movies teased
      WHERE edition.title = 'Avengers: Endgame: Encore' AND teased.title = 'Avengers: Doomsday'
      ON CONFLICT (edition_id, movie_id) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('movie_edition_teases');
    await queryRunner.dropTable('movie_edition_releases');
    await queryRunner.dropTable('movie_editions');
  }
}
