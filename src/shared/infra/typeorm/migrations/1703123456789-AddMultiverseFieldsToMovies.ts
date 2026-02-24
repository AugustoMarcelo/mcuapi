import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddMultiverseFieldsToMovies1703123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('movies', [
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
        default: "'movie'",
      }),
    ]);

    // Add timeline fields
    await queryRunner.addColumns('movies', [
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
    await queryRunner.dropColumn('movies', 'studio');
    await queryRunner.dropColumn('movies', 'continuity');
    await queryRunner.dropColumn('movies', 'multiverse_designation');
    await queryRunner.dropColumn('movies', 'is_mcu');
    await queryRunner.dropColumn('movies', 'type');
    await queryRunner.dropColumn('movies', 'timeline_universe');
    await queryRunner.dropColumn('movies', 'timeline_chronology_order');
    await queryRunner.dropColumn('movies', 'timeline_starts_at');
    await queryRunner.dropColumn('movies', 'timeline_ends_at');
  }
} 