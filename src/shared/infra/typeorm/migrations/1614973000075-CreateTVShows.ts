import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateTVShows1614973000075 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tvshows',
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
            name: 'overview',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'release_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'last_aired_date',
            type: 'date',
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
            name: 'number_seasons',
            type: 'int',
            default: 0,
          },
          {
            name: 'number_episodes',
            type: 'int',
            default: 0,
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
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tvshows');
  }
}
