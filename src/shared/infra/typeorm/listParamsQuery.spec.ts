import { FindOperator } from 'typeorm';
import { ColumnAllowList } from '@shared/infra/http/listParams';
import { buildOrderFromClauses, buildWhereFromFilter } from './listParamsQuery';

type Column = 'title' | 'phase';

const ALLOW_LIST: ColumnAllowList<Column> = {
  title: 'text',
  phase: 'exact',
};

describe('buildWhereFromFilter', () => {
  it('Should return an empty object when there are no filter clauses', () => {
    expect(buildWhereFromFilter(undefined, ALLOW_LIST)).toEqual({});
  });

  it('Should build a Raw ILIKE condition for a text column', () => {
    const where = buildWhereFromFilter(
      [{ column: 'title', value: 'Iron' }],
      ALLOW_LIST,
    );
    const operator = where.title as FindOperator<unknown>;

    expect(operator.getSql?.('alias')).toBe('alias ILIKE :title_0');
    expect(operator.objectLiteralParameters).toEqual({ title_0: '%Iron%' });
  });

  it('Should build a Raw equality condition for an exact column', () => {
    const where = buildWhereFromFilter(
      [{ column: 'phase', value: '1' }],
      ALLOW_LIST,
    );
    const operator = where.phase as FindOperator<unknown>;

    expect(operator.getSql?.('alias')).toBe('alias = :phase_0');
    expect(operator.objectLiteralParameters).toEqual({ phase_0: '1' });
  });

  it('Should AND multiple clauses targeting the same column instead of dropping earlier ones', () => {
    const where = buildWhereFromFilter(
      [
        { column: 'title', value: 'Iron' },
        { column: 'title', value: 'Man' },
      ],
      ALLOW_LIST,
    );
    const operator = where.title as FindOperator<unknown>;

    expect(operator.getSql?.('alias')).toBe(
      'alias ILIKE :title_0 AND alias ILIKE :title_1',
    );
    expect(operator.objectLiteralParameters).toEqual({
      title_0: '%Iron%',
      title_1: '%Man%',
    });
  });

  it('Should build independent conditions for different columns', () => {
    const where = buildWhereFromFilter(
      [
        { column: 'title', value: 'Iron' },
        { column: 'phase', value: '1' },
      ],
      ALLOW_LIST,
    );

    expect(Object.keys(where)).toEqual(['title', 'phase']);
  });

  it('Should not collide parameter names across different columns when merged into one parameter bag', () => {
    const where = buildWhereFromFilter(
      [
        { column: 'title', value: 'Iron' },
        { column: 'phase', value: '1' },
      ],
      ALLOW_LIST,
    );

    const titleOperator = where.title as FindOperator<unknown>;
    const phaseOperator = where.phase as FindOperator<unknown>;

    const mergedParameters = {
      ...titleOperator.objectLiteralParameters,
      ...phaseOperator.objectLiteralParameters,
    };

    expect(mergedParameters).toEqual({
      title_0: '%Iron%',
      phase_0: '1',
    });
  });
});

describe('buildOrderFromClauses', () => {
  it('Should return undefined when there are no order clauses', () => {
    expect(buildOrderFromClauses(undefined)).toBeUndefined();
    expect(buildOrderFromClauses([])).toBeUndefined();
  });

  it('Should merge order clauses into a single column-direction map', () => {
    expect(
      buildOrderFromClauses([
        { column: 'phase', direction: 'DESC' },
        { column: 'title', direction: 'ASC' },
      ]),
    ).toEqual({ phase: 'DESC', title: 'ASC' });
  });
});
