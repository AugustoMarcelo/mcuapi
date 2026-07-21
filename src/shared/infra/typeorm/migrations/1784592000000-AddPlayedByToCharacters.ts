import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddPlayedByToCharacters1784592000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'characters',
      new TableColumn({
        name: 'played_by',
        type: 'varchar',
        isNullable: true,
        comment: 'Actor name(s); recast characters list all, comma-separated',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('characters', 'played_by');
  }
}
