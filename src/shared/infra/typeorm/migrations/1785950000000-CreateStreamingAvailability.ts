import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Where each title can be watched.
 *
 * Region-aware from the start: streaming rights are sold per territory, so a
 * row without a region is wrong for most of the world rather than merely
 * incomplete. `region` is an ISO 3166-1 alpha-2 code.
 *
 * A title can appear several times per region, once per provider — so the
 * uniqueness is title × region × provider rather than a single column on the
 * title.
 *
 * Follows the `character_appearances` shape: `movie_id` and `tvshow_id` are
 * both nullable and exactly one is set.
 */
export default class CreateStreamingAvailability1785950000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'streaming_availability',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'movie_id', type: 'int', isNullable: true },
          { name: 'tvshow_id', type: 'int', isNullable: true },
          {
            name: 'region',
            type: 'varchar',
            length: '2',
            comment: 'ISO 3166-1 alpha-2, e.g. US, BR',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '60',
            comment: 'Service name as the viewer sees it, e.g. Disney+',
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: true,
            comment: "The provider's own page for this title, when known",
          },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'streaming_availability',
      new TableForeignKey({
        name: 'FKStreamingMovieId',
        referencedTableName: 'movies',
        referencedColumnNames: ['id'],
        columnNames: ['movie_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'streaming_availability',
      new TableForeignKey({
        name: 'FKStreamingTVShowId',
        referencedTableName: 'tvshows',
        referencedColumnNames: ['id'],
        columnNames: ['tvshow_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Exactly one of the two ids — the join table this mirrors has no such
    // guard and has drifted, so it is enforced here rather than by convention.
    await queryRunner.query(
      `ALTER TABLE "streaming_availability"
       ADD CONSTRAINT "CHKStreamingOneTarget"
       CHECK (("movie_id" IS NOT NULL) <> ("tvshow_id" IS NOT NULL))`,
    );

    // Re-running the seed, or an MCP edit repeating an entry, must not
    // duplicate a row. Partial indexes because NULLs never compare equal.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQStreamingMovie"
       ON "streaming_availability" ("movie_id", "region", "provider")
       WHERE "movie_id" IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQStreamingTVShow"
       ON "streaming_availability" ("tvshow_id", "region", "provider")
       WHERE "tvshow_id" IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDXStreamingRegion" ON "streaming_availability" ("region")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('streaming_availability');
  }
}
