import AppDataSource from '@shared/infra/typeorm/dataSource';
import ISearchRepository from '@modules/search/repositories/ISearchRepository';
import ISearchDTO from '@modules/search/dtos/ISearchDTO';
import IRankSearchResponseDTO from '@modules/search/dtos/IRankSearchResponseDTO';
import ISearchRankHitDTO from '@modules/search/dtos/ISearchRankHitDTO';
import { SEARCH_TYPES, SearchType } from '@modules/search/entities/searchTypes';

type BranchBuilder = (qParam: string) => string;

// `%` is the pg_trgm similarity operator (typo tolerance); ILIKE is kept
// alongside it because a short query against a long multi-word title can
// score below the trigram match threshold even though it's a clean substring
// match. Both conditions use the same GIN gin_trgm_ops index.
const BRANCH_BY_TYPE: Record<SearchType, BranchBuilder> = {
  movie: qParam => `
    SELECT id, 'movie'::text AS type, title AS label,
      similarity(title, ${qParam}) AS score
    FROM movies
    WHERE title % ${qParam} OR title ILIKE '%' || ${qParam} || '%'
  `,
  tvshow: qParam => `
    SELECT id, 'tvshow'::text AS type, title AS label,
      similarity(title, ${qParam}) AS score
    FROM tvshows
    WHERE title % ${qParam} OR title ILIKE '%' || ${qParam} || '%'
  `,
  character: qParam => `
    SELECT id, 'character'::text AS type, name AS label,
      GREATEST(similarity(name, ${qParam}), similarity(alias, ${qParam})) AS score
    FROM characters
    WHERE name % ${qParam} OR alias % ${qParam}
      OR name ILIKE '%' || ${qParam} || '%' OR alias ILIKE '%' || ${qParam} || '%'
  `,
  person: qParam => `
    SELECT id, 'person'::text AS type, name AS label,
      similarity(name, ${qParam}) AS score
    FROM people
    WHERE name % ${qParam} OR name ILIKE '%' || ${qParam} || '%'
  `,
};

class SearchRepository implements ISearchRepository {
  public async rank({
    q,
    type,
    page,
    limit,
  }: ISearchDTO): Promise<IRankSearchResponseDTO> {
    const params: unknown[] = [];
    const bind = (value: unknown): string => {
      params.push(value);
      return `$${params.length}`;
    };

    const qParam = bind(q);
    const types = type ? [type] : SEARCH_TYPES;
    const union = types
      .map(searchType => BRANCH_BY_TYPE[searchType](qParam))
      .join(' UNION ALL ');

    const countParams = [...params];

    let limitOffset = '';
    if (limit !== undefined) {
      limitOffset += ` LIMIT ${bind(limit)}`;

      if (page !== undefined) {
        limitOffset += ` OFFSET ${bind((page - 1) * limit)}`;
      }
    }

    const dataSql = `
      WITH ranked AS (${union})
      SELECT id, type FROM ranked
      ORDER BY score DESC, label ASC${limitOffset}
    `;
    const countSql = `SELECT COUNT(*) FROM (${union}) AS matches`;

    const [hits, countRows]: [ISearchRankHitDTO[], Array<{ count: string }>] =
      await Promise.all([
        AppDataSource.query(dataSql, params),
        AppDataSource.query(countSql, countParams),
      ]);

    return { hits, total: Number(countRows[0].count) };
  }
}

export default SearchRepository;
