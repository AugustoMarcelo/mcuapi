import { Raw } from 'typeorm';
import {
  ColumnAllowList,
  FilterClause,
  OrderClause,
} from '@shared/infra/http/listParams';

export function buildWhereFromFilter<T extends string>(
  filter: FilterClause<T>[] | undefined,
  allowList: ColumnAllowList<T>,
): Record<string, unknown> {
  const valuesByColumn = new Map<T, string[]>();

  filter?.forEach(({ column, value }) => {
    const values = valuesByColumn.get(column) ?? [];
    values.push(value);
    valuesByColumn.set(column, values);
  });

  const where: Record<string, unknown> = {};

  valuesByColumn.forEach((values, column) => {
    const isExact = allowList[column] === 'exact';
    // Parameter names must be unique across the whole query, not just per
    // column: TypeORM merges every Raw() operator's parameters into one flat
    // object, so reusing e.g. "value0" for two different columns silently
    // overwrites the first column's bound value with the second's.
    const paramNames = values.map((_, index) => `${column}_${index}`);

    where[column] = Raw(
      alias =>
        paramNames
          .map(paramName =>
            isExact
              ? `${alias} = :${paramName}`
              : `${alias} ILIKE :${paramName}`,
          )
          .join(' AND '),
      Object.fromEntries(
        paramNames.map((paramName, index) => [
          paramName,
          isExact ? values[index] : `%${values[index]}%`,
        ]),
      ),
    );
  });

  return where;
}

export function buildSelectFromColumns<T extends string>(
  columns: T[] | undefined,
): Record<T, true> | undefined {
  if (!columns?.length) {
    return undefined;
  }

  return Object.fromEntries(columns.map(column => [column, true])) as Record<
    T,
    true
  >;
}

export function buildOrderFromClauses<T extends string>(
  order: OrderClause<T>[] | undefined,
): Record<string, 'ASC' | 'DESC'> | undefined {
  if (!order?.length) {
    return undefined;
  }

  const result: Record<string, 'ASC' | 'DESC'> = {};

  // A column repeated in the clause list only has an effect the first time
  // it appears — any later ORDER BY on the same column is unreachable, so
  // the first occurrence's direction wins instead of a later one silently
  // replacing it.
  order.forEach(({ column, direction }) => {
    if (!Object.prototype.hasOwnProperty.call(result, column)) {
      result[column] = direction;
    }
  });

  return result;
}
