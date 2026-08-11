import {
  ColumnAllowList,
  resolveColumns,
  resolveFilter,
  resolveOrder,
} from './listParams';

type Column = 'title' | 'release_date' | 'phase';

const ALLOW_LIST: ColumnAllowList<Column> = {
  title: 'text',
  release_date: 'exact',
  phase: 'exact',
};

describe('resolveColumns', () => {
  it('Should return undefined when the value is missing or not a string', () => {
    expect(resolveColumns(undefined, ALLOW_LIST)).toBeUndefined();
    expect(resolveColumns(42, ALLOW_LIST)).toBeUndefined();
  });

  it('Should split and trim a comma-separated list of allowed columns', () => {
    expect(resolveColumns('title, phase', ALLOW_LIST)).toEqual([
      'title',
      'phase',
    ]);
  });

  it('Should drop columns that are not in the allow list', () => {
    expect(resolveColumns('title,unknown_column', ALLOW_LIST)).toEqual([
      'title',
    ]);
  });

  it('Should return undefined when no column survives the allow list', () => {
    expect(resolveColumns('unknown_column', ALLOW_LIST)).toBeUndefined();
  });

  it('Should not treat inherited Object.prototype properties as allowed columns', () => {
    expect(
      resolveColumns('constructor,hasOwnProperty,toString', ALLOW_LIST),
    ).toBeUndefined();
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

  it('Should drop clauses with an unknown column or invalid direction', () => {
    expect(
      resolveOrder('unknown_column,ASC;title,SIDEWAYS;phase,DESC', ALLOW_LIST),
    ).toEqual([{ column: 'phase', direction: 'DESC' }]);
  });

  it('Should not treat inherited Object.prototype properties as allowed columns', () => {
    expect(resolveOrder('toString,ASC', ALLOW_LIST)).toBeUndefined();
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

  it('Should drop clauses with an unknown column or empty value', () => {
    expect(
      resolveFilter('unknown_column=value;title=;phase=1', ALLOW_LIST),
    ).toEqual([{ column: 'phase', value: '1' }]);
  });

  it('Should not treat inherited Object.prototype properties as allowed columns', () => {
    expect(resolveFilter('constructor=x', ALLOW_LIST)).toBeUndefined();
  });
});
