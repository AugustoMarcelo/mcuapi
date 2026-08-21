import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AddSearchTrgmIndexes1787256758056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS movies_title_trgm_idx ON movies USING GIN (title gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS tvshows_title_trgm_idx ON tvshows USING GIN (title gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS characters_name_trgm_idx ON characters USING GIN (name gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS characters_alias_trgm_idx ON characters USING GIN (alias gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS people_name_trgm_idx ON people USING GIN (name gin_trgm_ops)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS people_name_trgm_idx');
    await queryRunner.query('DROP INDEX IF EXISTS characters_alias_trgm_idx');
    await queryRunner.query('DROP INDEX IF EXISTS characters_name_trgm_idx');
    await queryRunner.query('DROP INDEX IF EXISTS tvshows_title_trgm_idx');
    await queryRunner.query('DROP INDEX IF EXISTS movies_title_trgm_idx');
    // pg_trgm itself is left installed on down — cheap to keep, and other
    // objects created outside this migration's scope could depend on it.
  }
}
