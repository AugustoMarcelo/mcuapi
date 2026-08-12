import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
} from 'typeorm';

interface IPersonSourceRow {
  id: number;
  played_by?: string;
  directed_by?: string;
}

function splitNames(value: string): string[] {
  return value
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
}

async function upsertPersonId({
  queryRunner,
  cache,
  name,
}: {
  queryRunner: QueryRunner;
  cache: Map<string, number>;
  name: string;
}): Promise<number> {
  const cached = cache.get(name);

  if (cached) {
    return cached;
  }

  const [existing] = await queryRunner.query(
    'SELECT id FROM people WHERE name = $1',
    [name],
  );

  if (existing) {
    cache.set(name, existing.id);
    return existing.id;
  }

  const [inserted] = await queryRunner.query(
    'INSERT INTO people (name, created_at, updated_at) VALUES ($1, now(), now()) RETURNING id',
    [name],
  );

  cache.set(name, inserted.id);
  return inserted.id;
}

/**
 * `played_by`/`directed_by` are comma-separated strings authored in-story
 * chronological order (see the mcu-data-sourcing skill) — splitting
 * left-to-right and enumerating already produces the correct recast_order,
 * no extra lookup needed. Person upserts must stay sequential (not
 * Promise.all'd) so the in-memory name->id cache actually dedupes people
 * shared across characters and titles instead of racing duplicate inserts.
 */
/* eslint-disable no-await-in-loop */
export default class CreatePeople1786200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'people',
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
            isUnique: true,
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

    await queryRunner.createTable(
      new Table({
        name: 'person_characters',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'person_id',
            type: 'int',
          },
          {
            name: 'character_id',
            type: 'int',
          },
          {
            name: 'recast_order',
            type: 'int',
            comment:
              "In-story chronological position among a character's actors; 1 is earliest",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'person_characters',
      new TableForeignKey({
        name: 'PersonCharacterPerson',
        columnNames: ['person_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'people',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'person_characters',
      new TableForeignKey({
        name: 'PersonCharacterCharacter',
        columnNames: ['character_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'characters',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'person_titles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'person_id',
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
            name: 'role',
            type: 'varchar',
            comment: 'e.g., "director"',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'person_titles',
      new TableForeignKey({
        name: 'PersonTitlePerson',
        columnNames: ['person_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'people',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'person_titles',
      new TableForeignKey({
        name: 'PersonTitleMovie',
        columnNames: ['movie_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'movies',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'person_titles',
      new TableForeignKey({
        name: 'PersonTitleTVShow',
        columnNames: ['tvshow_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tvshows',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createCheckConstraint(
      'person_titles',
      new TableCheck({
        name: 'PersonTitleExactlyOneTarget',
        columnNames: ['movie_id', 'tvshow_id'],
        expression: 'num_nonnulls(movie_id, tvshow_id) = 1',
      }),
    );

    const personIdByName = new Map<string, number>();

    const characters: IPersonSourceRow[] = await queryRunner.query(
      "SELECT id, played_by FROM characters WHERE played_by IS NOT NULL AND played_by <> ''",
    );

    for (const character of characters) {
      const names = splitNames(character.played_by as string);

      for (const [index, name] of names.entries()) {
        const personId = await upsertPersonId({
          queryRunner,
          cache: personIdByName,
          name,
        });

        await queryRunner.query(
          'INSERT INTO person_characters (person_id, character_id, recast_order, created_at) VALUES ($1, $2, $3, now())',
          [personId, character.id, index + 1],
        );
      }
    }

    const movies: IPersonSourceRow[] = await queryRunner.query(
      "SELECT id, directed_by FROM movies WHERE directed_by IS NOT NULL AND directed_by <> ''",
    );

    for (const movie of movies) {
      const names = splitNames(movie.directed_by as string);

      for (const name of names) {
        const personId = await upsertPersonId({
          queryRunner,
          cache: personIdByName,
          name,
        });

        await queryRunner.query(
          "INSERT INTO person_titles (person_id, movie_id, role, created_at) VALUES ($1, $2, 'director', now())",
          [personId, movie.id],
        );
      }
    }

    const tvshows: IPersonSourceRow[] = await queryRunner.query(
      "SELECT id, directed_by FROM tvshows WHERE directed_by IS NOT NULL AND directed_by <> ''",
    );

    for (const tvshow of tvshows) {
      const names = splitNames(tvshow.directed_by as string);

      for (const name of names) {
        const personId = await upsertPersonId({
          queryRunner,
          cache: personIdByName,
          name,
        });

        await queryRunner.query(
          "INSERT INTO person_titles (person_id, tvshow_id, role, created_at) VALUES ($1, $2, 'director', now())",
          [personId, tvshow.id],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropCheckConstraint(
      'person_titles',
      'PersonTitleExactlyOneTarget',
    );
    await queryRunner.dropForeignKey('person_titles', 'PersonTitlePerson');
    await queryRunner.dropForeignKey('person_titles', 'PersonTitleMovie');
    await queryRunner.dropForeignKey('person_titles', 'PersonTitleTVShow');
    await queryRunner.dropTable('person_titles');

    await queryRunner.dropForeignKey(
      'person_characters',
      'PersonCharacterPerson',
    );
    await queryRunner.dropForeignKey(
      'person_characters',
      'PersonCharacterCharacter',
    );
    await queryRunner.dropTable('person_characters');

    await queryRunner.dropTable('people');
  }
}
/* eslint-enable no-await-in-loop */
