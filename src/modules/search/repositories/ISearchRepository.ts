import ISearchDTO from '../dtos/ISearchDTO';
import IRankSearchResponseDTO from '../dtos/IRankSearchResponseDTO';

export default interface ISearchRepository {
  rank(data: ISearchDTO): Promise<IRankSearchResponseDTO>;
}
