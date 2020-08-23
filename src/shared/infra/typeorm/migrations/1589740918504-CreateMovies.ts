import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateMovies1589740918504 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'movies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'release_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'box_office',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'overview',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'cover_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'trailer_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'directed_by',
            type: 'varchar',
          },
          {
            name: 'phase',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'saga',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'chronology',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'post_credit_scenes',
            type: 'int',
            default: 0,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('movies');
  }
}
