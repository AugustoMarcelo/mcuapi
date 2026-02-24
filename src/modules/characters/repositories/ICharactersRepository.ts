import ICharacter from '../entities/ICharacter';
import ICreateCharacterDTO from '../dtos/ICreateCharacterDTO';
import IFindAllCharactersDTO from '../dtos/IFindAllCharactersDTO';
import IFindAllCharactersResponseDTO from '../dtos/IFindAllCharactersResponseDTO';

export default interface ICharactersRepository {
  create(data: ICreateCharacterDTO): Promise<ICharacter>;
  update(character: ICharacter): Promise<ICharacter>;
  findById(id: number): Promise<ICharacter | undefined>;
  findAll(data: IFindAllCharactersDTO): Promise<IFindAllCharactersResponseDTO>;
  findByMovieId(movie_id: number): Promise<Array<ICharacter & { role_type?: string }>>;
  findByTVShowId(tvshow_id: number): Promise<Array<ICharacter & { role_type?: string }>>;
}
