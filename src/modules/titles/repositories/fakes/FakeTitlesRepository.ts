import ITitleItemDTO from '@modules/titles/dtos/ITitleItemDTO';
import IFindAllTitlesDTO from '@modules/titles/dtos/IFindAllTitlesDTO';
import IFindAllTitlesResponseDTO from '@modules/titles/dtos/IFindAllTitlesResponseDTO';
import ITitlesRepository from '@modules/titles/repositories/ITitlesRepository';
import TITLE_COLUMNS, {
  DEFAULT_TITLE_COLUMNS,
  TitleColumn,
} from '@modules/titles/entities/titleColumns';
import { OrderClause } from '@shared/infra/http/listParams';
import compareValues from '@shared/utils/compareValues';

class FakeTitlesRepository implements ITitlesRepository {
  private titles: ITitleItemDTO[] = [];

  public seed(data: ITitleItemDTO): ITitleItemDTO {
    this.titles.push(data);

    return data;
  }

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
    let filtered = [...this.titles];

    filter?.forEach(({ column, value }) => {
      filtered = filtered.filter(title => {
        const titleValue = title[column];

        if (titleValue === undefined || titleValue === null) {
          return false;
        }

        return TITLE_COLUMNS[column] === 'exact'
          ? String(titleValue) === value
          : String(titleValue).toLowerCase().includes(value.toLowerCase());
      });
    });

    if (studio) {
      filtered = filtered.filter(title => title.studio === studio);
    }

    if (continuity) {
      filtered = filtered.filter(title => title.continuity === continuity);
    }

    if (multiverse_designation) {
      filtered = filtered.filter(
        title => title.multiverse_designation === multiverse_designation,
      );
    }

    if (is_mcu !== undefined) {
      filtered = filtered.filter(title => title.is_mcu === is_mcu);
    }

    if (type) {
      filtered = filtered.filter(title => title.type === type);
    }

    if (releaseDateAfter) {
      filtered = filtered.filter(
        title =>
          !!title.release_date &&
          new Date(title.release_date).getTime() > releaseDateAfter.getTime(),
      );
    }

    // Mirrors Postgres' default null ordering (NULLS LAST for ASC, NULLS
    // FIRST for DESC) via compareValues — matches the real repository's plain
    // `ORDER BY release_date ASC` without needing an explicit NULLS clause.
    const orderClauses: OrderClause<TitleColumn>[] = order?.length
      ? order
      : [{ column: 'release_date', direction: 'ASC' }];

    filtered = [...filtered].sort((a, b) => {
      const clause = orderClauses.find(
        ({ column }) => compareValues(a[column], b[column]) !== 0,
      );

      if (!clause) return 0;

      const comparison = compareValues(a[clause.column], b[clause.column]);

      return clause.direction === 'ASC' ? comparison : -comparison;
    });

    const total = filtered.length;

    const offset = page && limit ? (page - 1) * limit : 0;
    const end = limit === undefined ? undefined : offset + limit;
    const paged = filtered.slice(offset, end);

    const selectedColumns = columns?.length ? columns : DEFAULT_TITLE_COLUMNS;

    const data = paged.map(title => {
      const projected: Partial<ITitleItemDTO> = {
        id: title.id,
        type: title.type,
      };

      selectedColumns.forEach(column => {
        Object.assign(projected, { [column]: title[column] });
      });

      return projected as ITitleItemDTO;
    });

    return { data, total };
  }
}

export default FakeTitlesRepository;
