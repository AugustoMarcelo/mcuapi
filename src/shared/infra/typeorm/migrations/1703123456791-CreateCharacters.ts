import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export default class CreateCharacters1703123456791 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'characters',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'alias',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'continuity',
            type: 'varchar',
            isNullable: true,
            default: "'MCU'",
          },
          {
            name: 'multiverse_designation',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'variant_of',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'first_appearance_movie_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'first_appearance_tvshow_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Add foreign key for variant_of (self-referencing)
    await queryRunner.createForeignKey(
      'characters',
      new TableForeignKey({
        name: 'CharacterVariantOf',
        columnNames: ['variant_of'],
        referencedColumnNames: ['id'],
        referencedTableName: 'characters',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key for first_appearance_movie_id
    await queryRunner.createForeignKey(
      'characters',
      new TableForeignKey({
        name: 'CharacterFirstAppearanceMovie',
        columnNames: ['first_appearance_movie_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'movies',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key for first_appearance_tvshow_id
    await queryRunner.createForeignKey(
      'characters',
      new TableForeignKey({
        name: 'CharacterFirstAppearanceTVShow',
        columnNames: ['first_appearance_tvshow_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tvshows',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('characters', 'CharacterVariantOf');
    await queryRunner.dropForeignKey('characters', 'CharacterFirstAppearanceMovie');
    await queryRunner.dropForeignKey('characters', 'CharacterFirstAppearanceTVShow');
    await queryRunner.dropTable('characters');
  }
} 