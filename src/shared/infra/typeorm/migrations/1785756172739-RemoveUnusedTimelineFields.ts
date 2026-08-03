import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveUnusedTimelineFields1785756172739 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('movies', 'timeline_universe');
    await queryRunner.dropColumn('movies', 'timeline_starts_at');
    await queryRunner.dropColumn('movies', 'timeline_ends_at');

    await queryRunner.dropColumn('tvshows', 'timeline_universe');
    await queryRunner.dropColumn('tvshows', 'timeline_starts_at');
    await queryRunner.dropColumn('tvshows', 'timeline_ends_at');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('movies', [
      new TableColumn({
        name: 'timeline_universe',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeline_starts_at',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeline_ends_at',
        type: 'varchar',
        isNullable: true,
      }),
    ]);

    await queryRunner.addColumns('tvshows', [
      new TableColumn({
        name: 'timeline_universe',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeline_starts_at',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeline_ends_at',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }
}
