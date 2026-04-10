import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddUpdatedAtToTVShows1775850111847
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tvshows',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamptz',
        default: 'now()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tvshows', 'updated_at');
  }
}
