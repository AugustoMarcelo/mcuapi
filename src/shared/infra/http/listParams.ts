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
  return Object.prototype.hasOwnProperty.call(allowList, column);
}

export function resolveColumns<T extends string>(
  value: unknown,
  allowList: ColumnAllowList<T>,
): T[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const columns = resolveString({ value, name: 'columns' })
    .split(',')
    .map(column => column.trim());

  if (
    !columns.length ||
    columns.some(column => !isAllowedColumn(column, allowList)) ||
    new Set(columns).size !== columns.length
  ) {
    throw new AppError('columns must contain unique supported column names');
  }

  return columns as T[];
}

export function resolveOrder<T extends string>(
  value: unknown,
  allowList: ColumnAllowList<T>,
): OrderClause<T>[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const clauses: OrderClause<T>[] = [];

  resolveString({ value, name: 'order' })
    .split(';')
    .map(clause => clause.trim())
    .forEach(clause => {
      const parts = clause.split(',').map(item => item.trim());
      const [column, direction] = parts;
      const sortingOrder = (direction ?? 'ASC').toUpperCase();

      if (
        parts.length > 2 ||
        (parts.length === 2 && !direction) ||
        !isAllowedColumn(column, allowList) ||
        (sortingOrder !== 'ASC' && sortingOrder !== 'DESC')
      ) {
        throw new AppError('order must use supported columns and ASC or DESC');
      }

      clauses.push({ column, direction: sortingOrder });
    });

  if (
    !clauses.length ||
    new Set(clauses.map(({ column }) => column)).size !== clauses.length
  ) {
    throw new AppError('order must contain unique supported column names');
  }

  return clauses;
}

export function resolveBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new AppError('is_mcu must be true or false');
}

export function resolveFilter<T extends string>(
  value: unknown,
  allowList: ColumnAllowList<T>,
): FilterClause<T>[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const clauses: FilterClause<T>[] = [];

  resolveString({ value, name: 'filter' })
    .split(';')
    .map(clause => clause.trim())
    .forEach(clause => {
      const [column, ...rest] = clause.split('=').map(item => item.trim());
      const filterValue = rest.join('=');

      if (!isAllowedColumn(column, allowList) || !filterValue) {
        throw new AppError(
          'filter must use supported columns with non-empty values',
        );
      }

      clauses.push({ column, value: filterValue });
    });

  if (!clauses.length) {
    throw new AppError('filter must contain at least one clause');
  }

  return clauses;
}

export function resolveString({
  value,
  name,
}: {
  value: unknown;
  name: string;
}): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${name} must be a non-empty string`);
  }

  return value;
}
import AppError from '@shared/errors/AppError';
