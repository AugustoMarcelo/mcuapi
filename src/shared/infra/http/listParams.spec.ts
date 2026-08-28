import {
  ColumnAllowList,
  resolveColumns,
  resolveFilter,
  resolveOrder,
} from './listParams';
import AppError from '@shared/errors/AppError';

type Column = 'title' | 'release_date' | 'phase';

const ALLOW_LIST: ColumnAllowList<Column> = {
  title: 'text',
  release_date: 'exact',
  phase: 'exact',
};

describe('resolveColumns', () => {
  it('Should return undefined only when the value is missing', () => {
    expect(resolveColumns(undefined, ALLOW_LIST)).toBeUndefined();
  });

  it('Should split and trim a comma-separated list of allowed columns', () => {
    expect(resolveColumns('title, phase', ALLOW_LIST)).toEqual([
      'title',
      'phase',
    ]);
  });

  it('Should reject invalid and duplicate columns', () => {
    [42, 'title,unknown_column', 'unknown_column', 'title,title'].forEach(
      value => {
        expect(() => resolveColumns(value, ALLOW_LIST)).toThrow(AppError);
      },
    );
  });
});

describe('resolveOrder', () => {
  it('Should return undefined when the value is missing or not a string', () => {
    expect(resolveOrder(undefined, ALLOW_LIST)).toBeUndefined();
  });

  it('Should default to ASC when no direction is given', () => {
    expect(resolveOrder('title', ALLOW_LIST)).toEqual([
      { column: 'title', direction: 'ASC' },
    ]);
  });

  it('Should uppercase an explicit direction', () => {
    expect(resolveOrder('release_date,desc', ALLOW_LIST)).toEqual([
      { column: 'release_date', direction: 'DESC' },
    ]);
  });

  it('Should support multiple order clauses separated by semicolons', () => {
    expect(resolveOrder('phase,DESC;title,ASC', ALLOW_LIST)).toEqual([
      { column: 'phase', direction: 'DESC' },
      { column: 'title', direction: 'ASC' },
    ]);
  });

  it('Should reject unsupported columns, directions, and duplicate clauses', () => {
    [
      'unknown_column,ASC;title,SIDEWAYS;phase,DESC',
      'toString,ASC',
      'title,ASC;title,DESC',
      'title,',
      'title, ',
    ].forEach(value => {
      expect(() => resolveOrder(value, ALLOW_LIST)).toThrow(AppError);
    });
  });
});

describe('resolveFilter', () => {
  it('Should return undefined when the value is missing or not a string', () => {
    expect(resolveFilter(undefined, ALLOW_LIST)).toBeUndefined();
  });

  it('Should parse a single column=value clause', () => {
    expect(resolveFilter('title=Iron Man', ALLOW_LIST)).toEqual([
      { column: 'title', value: 'Iron Man' },
    ]);
  });

  it('Should support multiple filter clauses separated by semicolons', () => {
    expect(resolveFilter('title=Iron;phase=1', ALLOW_LIST)).toEqual([
      { column: 'title', value: 'Iron' },
      { column: 'phase', value: '1' },
    ]);
  });

  it('Should keep the rest of the value when it contains an equals sign', () => {
    expect(resolveFilter('title=a=b', ALLOW_LIST)).toEqual([
      { column: 'title', value: 'a=b' },
    ]);
  });

  it('Should reject unsupported columns and empty values', () => {
    ['unknown_column=value;title=;phase=1', 'constructor=x'].forEach(value => {
      expect(() => resolveFilter(value, ALLOW_LIST)).toThrow(AppError);
    });
  });
});
