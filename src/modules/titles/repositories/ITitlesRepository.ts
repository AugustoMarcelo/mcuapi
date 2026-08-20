import IFindAllTitlesDTO from '../dtos/IFindAllTitlesDTO';
import IFindAllTitlesResponseDTO from '../dtos/IFindAllTitlesResponseDTO';

export default interface ITitlesRepository {
  findAll(data: IFindAllTitlesDTO): Promise<IFindAllTitlesResponseDTO>;
}
