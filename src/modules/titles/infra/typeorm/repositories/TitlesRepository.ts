import AppDataSource from '@shared/infra/typeorm/dataSource';
import ITitlesRepository from '@modules/titles/repositories/ITitlesRepository';
import IFindAllTitlesDTO from '@modules/titles/dtos/IFindAllTitlesDTO';
import IFindAllTitlesResponseDTO from '@modules/titles/dtos/IFindAllTitlesResponseDTO';
import ITitleItemDTO from '@modules/titles/dtos/ITitleItemDTO';
import TITLE_COLUMNS, {
  DEFAULT_TITLE_COLUMNS,
  TitleColumn,
} from '@modules/titles/entities/titleColumns';
import { OrderClause } from '@shared/infra/http/listParams';

function resolveOutputColumns(
  columns: TitleColumn[] | undefined,
): TitleColumn[] {
  const requested = columns?.length ? columns : DEFAULT_TITLE_COLUMNS;
  const withId: TitleColumn[] = requested.includes('id')
    ? requested
    : ['id', ...requested];

  return withId.filter(column => column !== 'type');
}

function resolveOrderClauses(
  order: OrderClause<TitleColumn>[] | undefined,
): OrderClause<TitleColumn>[] {
  const clauses: OrderClause<TitleColumn>[] = order?.length
    ? [...order]
    : [{ column: 'release_date', direction: 'ASC' }];

  if (!clauses.some(({ column }) => column === 'type')) {
    clauses.push({ column: 'type', direction: 'ASC' });
  }

  if (!clauses.some(({ column }) => column === 'id')) {
    clauses.push({ column: 'id', direction: 'ASC' });
  }

  return clauses;
}

function buildOrderClause(clauses: OrderClause<TitleColumn>[]): string {
  return `ORDER BY ${clauses
    .map(
      ({ column, direction }) =>
        `${column} ${direction}${column === 'release_date' ? ' NULLS LAST' : ''}`,
    )
    .join(', ')}`;
}

class TitlesRepository implements ITitlesRepository {
  public async findAll({
    page,
    limit,
    columns,
    order,
    filter,
    studio,
    continuity,
    multiverse_designation,
    is_mcu,
    type,
    releaseDateAfter,
  }: IFindAllTitlesDTO): Promise<IFindAllTitlesResponseDTO> {
    const params: unknown[] = [];
    const bind = (value: unknown): string => {
      params.push(value);
      return `$${params.length}`;
    };

    const conditions: string[] = [];

    filter?.forEach(({ column, value }) => {
      conditions.push(
        TITLE_COLUMNS[column] === 'exact'
          ? `${column} = ${bind(value)}`
          : `${column} ILIKE ${bind(`%${value}%`)}`,
      );
    });

    if (studio) conditions.push(`studio = ${bind(studio)}`);
    if (continuity) conditions.push(`continuity = ${bind(continuity)}`);
    if (multiverse_designation) {
      conditions.push(
        `multiverse_designation = ${bind(multiverse_designation)}`,
      );
    }
    if (is_mcu !== undefined) conditions.push(`is_mcu = ${bind(is_mcu)}`);
    if (type) conditions.push(`type = ${bind(type)}`);
    if (releaseDateAfter)
      conditions.push(`release_date > ${bind(releaseDateAfter)}`);

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const outputColumns = resolveOutputColumns(columns);
    const orderClauses = resolveOrderClauses(order);
    // `type` is always excluded here even when it's the sort column: the
    // literal `AS type` below already provides it, and selecting the real
    // column too gives the UNION two same-named output columns, which
    // Postgres rejects `ORDER BY type` against as ambiguous.
    const sqlColumns = Array.from(
      new Set([...outputColumns, ...orderClauses.map(({ column }) => column)]),
    ).filter(column => column !== 'type');
    const columnList = sqlColumns.join(', ');

    const union = `
      SELECT ${columnList}, 'movie' AS type FROM movies ${where}
      UNION ALL
      SELECT ${columnList}, 'tvshow' AS type FROM tvshows ${where}
    `;

    const countParams = [...params];

    let limitOffset = '';
    if (limit !== undefined) {
      limitOffset += ` LIMIT ${bind(limit)}`;

      if (page !== undefined) {
        limitOffset += ` OFFSET ${bind((page - 1) * limit)}`;
      }
    }

    const dataSql = `${union} ${buildOrderClause(orderClauses)}${limitOffset}`;
    const countSql = `SELECT COUNT(*) FROM (${union}) AS titles`;

    const [rawRows, countRows]: [ITitleItemDTO[], Array<{ count: string }>] =
      await Promise.all([
        AppDataSource.query(dataSql, params),
        AppDataSource.query(countSql, countParams),
      ]);

    const rows =
      sqlColumns.length === outputColumns.length
        ? rawRows
        : rawRows.map(row => {
            const projected: Partial<ITitleItemDTO> = { type: row.type };

            outputColumns.forEach(column => {
              Object.assign(projected, { [column]: row[column] });
            });

            return projected as ITitleItemDTO;
          });

    return { data: rows, total: Number(countRows[0].count) };
  }
}

export default TitlesRepository;
