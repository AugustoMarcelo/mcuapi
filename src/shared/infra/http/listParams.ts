export type ColumnMatchType = 'exact' | 'text';

export type ColumnAllowList<T extends string> = Readonly<
  Record<T, ColumnMatchType>
>;

export interface OrderClause<T extends string = string> {
  column: T;
  direction: 'ASC' | 'DESC';
}

export interface FilterClause<T extends string = string> {
  column: T;
  value: string;
}

function isAllowedColumn<T extends string>(
  column: string,
  allowList: ColumnAllowList<T>,
): column is T {
  return column in allowList;
}

export function resolveColumns<T extends string>(
  value: unknown,
  allowList: ColumnAllowList<T>,
): T[] | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const columns = value
    .split(',')
    .map(column => column.trim())
    .filter((column): column is T => isAllowedColumn(column, allowList));

  return columns.length ? columns : undefined;
}

export function resolveOrder<T extends string>(
  value: unknown,
  allowList: ColumnAllowList<T>,
): OrderClause<T>[] | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const clauses: OrderClause<T>[] = [];

  value
    .split(';')
    .map(clause => clause.trim())
    .filter(Boolean)
    .forEach(clause => {
      const [column, direction] = clause.split(',').map(item => item.trim());
      const sortingOrder = (direction || 'ASC').toUpperCase();

      if (
        isAllowedColumn(column, allowList) &&
        (sortingOrder === 'ASC' || sortingOrder === 'DESC')
      ) {
        clauses.push({ column, direction: sortingOrder });
      }
    });

  return clauses.length ? clauses : undefined;
}

export function resolveFilter<T extends string>(
  value: unknown,
  allowList: ColumnAllowList<T>,
): FilterClause<T>[] | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const clauses: FilterClause<T>[] = [];

  value
    .split(';')
    .map(clause => clause.trim())
    .filter(Boolean)
    .forEach(clause => {
      const [column, ...rest] = clause.split('=').map(item => item.trim());
      const filterValue = rest.join('=');

      if (isAllowedColumn(column, allowList) && filterValue) {
        clauses.push({ column, value: filterValue });
      }
    });

  return clauses.length ? clauses : undefined;
}
