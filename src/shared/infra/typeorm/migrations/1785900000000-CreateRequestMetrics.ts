import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Aggregate request counters. Deliberately stores no IP address, user agent,
 * query string or sub-day timestamp — only how many times a route pattern was
 * hit, per day, per status class. There is nothing here that identifies a
 * caller, so it needs no consent banner and carries no retention risk.
 *
 * Keyed on the route *pattern* (`/api/v1/movies/:movie_id`) rather than the
 * requested path, which bounds the row count by the size of the route table
 * instead of letting it grow with traffic.
 */
export default class CreateRequestMetrics1785900000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'request_metrics',
        columns: [
          {
            name: 'day',
            type: 'date',
            isPrimary: true,
          },
          {
            name: 'route',
            type: 'varchar',
            length: '120',
            isPrimary: true,
          },
          {
            name: 'status_class',
            type: 'smallint',
            isPrimary: true,
            comment: '2 for 2xx, 3 for 3xx, 4 for 4xx, 5 for 5xx',
          },
          {
            name: 'count',
            type: 'int',
            default: 0,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('request_metrics');
  }
}
