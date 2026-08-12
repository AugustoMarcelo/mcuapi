import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddChronologyToTVShows1776153600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tvshows',
      new TableColumn({
        name: 'chronology',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tvshows', 'chronology');
  }
}
