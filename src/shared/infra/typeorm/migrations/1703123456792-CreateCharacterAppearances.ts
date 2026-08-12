import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateCharacterAppearances1703123456792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'character_appearances',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'character_id',
            type: 'int',
          },
          {
            name: 'movie_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'tvshow_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'role_type',
            type: 'varchar',
            isNullable: true,
            comment: 'e.g., "main", "supporting", "cameo"',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Add foreign key for character_id
    await queryRunner.createForeignKey(
      'character_appearances',
      new TableForeignKey({
        name: 'CharacterAppearanceCharacter',
        columnNames: ['character_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'characters',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key for movie_id
    await queryRunner.createForeignKey(
      'character_appearances',
      new TableForeignKey({
        name: 'CharacterAppearanceMovie',
        columnNames: ['movie_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'movies',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key for tvshow_id
    await queryRunner.createForeignKey(
      'character_appearances',
      new TableForeignKey({
        name: 'CharacterAppearanceTVShow',
        columnNames: ['tvshow_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tvshows',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'character_appearances',
      'CharacterAppearanceCharacter',
    );
    await queryRunner.dropForeignKey(
      'character_appearances',
      'CharacterAppearanceMovie',
    );
    await queryRunner.dropForeignKey(
      'character_appearances',
      'CharacterAppearanceTVShow',
    );
    await queryRunner.dropTable('character_appearances');
  }
}
