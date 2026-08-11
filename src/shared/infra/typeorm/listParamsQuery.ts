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

    where[column] = Raw(
      alias =>
        values
          .map((_, index) =>
            isExact
              ? `${alias} = :value${index}`
              : `${alias} ILIKE :value${index}`,
          )
          .join(' AND '),
      Object.fromEntries(
        values.map((value, index) => [
          `value${index}`,
          isExact ? value : `%${value}%`,
        ]),
      ),
    );
  });

  return where;
}

export function buildOrderFromClauses<T extends string>(
  order: OrderClause<T>[] | undefined,
): Record<string, 'ASC' | 'DESC'> | undefined {
  if (!order?.length) {
    return undefined;
  }

  return order.reduce<Record<string, 'ASC' | 'DESC'>>(
    (acc, { column, direction }) => ({ ...acc, [column]: direction }),
    {},
  );
}
