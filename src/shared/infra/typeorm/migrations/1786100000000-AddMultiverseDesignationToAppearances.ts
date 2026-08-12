import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Where a character physically was during a given title.
 *
 * The character-level `multiverse_designation` means ORIGIN — the reality a
 * character is native to. That is a different question from where they turn up,
 * and the two diverge whenever someone crosses over: Reed Richards is native to
 * Earth-828 but fights in Earth-616 in Doomsday, and the Raimi/Webb Spider-Men
 * visit Earth-616 in No Way Home without ever belonging to it.
 *
 * Nullable, and null is the normal case: it means "the same reality the title
 * itself is set in". Only fill it when a character is somewhere other than the
 * title's own `multiverse_designation` — the Void sequences in Deadpool &
 * Wolverine being the clearest example.
 */
export default class AddMultiverseDesignationToAppearances1786100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'character_appearances',
      new TableColumn({
        name: 'multiverse_designation',
        type: 'varchar',
        isNullable: true,
        comment:
          'Reality the character was in for this title. Null means the same as the title itself.',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'character_appearances',
      'multiverse_designation',
    );
  }
}
