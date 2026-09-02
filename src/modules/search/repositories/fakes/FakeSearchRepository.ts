import ISearchRepository from '@modules/search/repositories/ISearchRepository';
import ISearchDTO from '@modules/search/dtos/ISearchDTO';
import IRankSearchResponseDTO from '@modules/search/dtos/IRankSearchResponseDTO';
import ISearchRankHitDTO from '@modules/search/dtos/ISearchRankHitDTO';

class FakeSearchRepository implements ISearchRepository {
  private hits: ISearchRankHitDTO[] = [];

  public seed(hits: ISearchRankHitDTO[]): void {
    this.hits = hits;
  }

  public async rank({
    type,
    page,
    limit,
  }: ISearchDTO): Promise<IRankSearchResponseDTO> {
    const filtered = type
      ? this.hits.filter(hit => hit.type === type)
      : this.hits;

    const total = filtered.length;
    const offset = page && limit ? (page - 1) * limit : 0;
    const end = limit === undefined ? undefined : offset + limit;

    return { hits: filtered.slice(offset, end), total };
  }
}

export default FakeSearchRepository;
