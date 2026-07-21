import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddMultiverseFieldsToTVShows1703123456790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('tvshows', [
      new TableColumn({
        name: 'studio',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'continuity',
        type: 'varchar',
        isNullable: true,
        default: "'MCU'",
      }),
      new TableColumn({
        name: 'multiverse_designation',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_mcu',
        type: 'boolean',
        default: true,
      }),
      new TableColumn({
        name: 'type',
        type: 'varchar',
        default: "'tvshow'",
      }),
    ]);

    // Add timeline fields
    await queryRunner.addColumns('tvshows', [
      new TableColumn({
        name: 'timeline_universe',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'timeline_chronology_order',
        type: 'integer',
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tvshows', 'studio');
    await queryRunner.dropColumn('tvshows', 'continuity');
    await queryRunner.dropColumn('tvshows', 'multiverse_designation');
    await queryRunner.dropColumn('tvshows', 'is_mcu');
    await queryRunner.dropColumn('tvshows', 'type');
    await queryRunner.dropColumn('tvshows', 'timeline_universe');
    await queryRunner.dropColumn('tvshows', 'timeline_chronology_order');
    await queryRunner.dropColumn('tvshows', 'timeline_starts_at');
    await queryRunner.dropColumn('tvshows', 'timeline_ends_at');
  }
} 