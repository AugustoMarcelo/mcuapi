import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';
import ICharacter from '../entities/ICharacter';
import ICreateCharacterDTO from '../dtos/ICreateCharacterDTO';
import IFindAllCharactersDTO from '../dtos/IFindAllCharactersDTO';
import IFindAllCharactersResponseDTO from '../dtos/IFindAllCharactersResponseDTO';

export default interface ICharactersRepository {
  create(data: ICreateCharacterDTO): Promise<ICharacter>;
  update(character: ICharacter): Promise<ICharacter>;
  findById(id: number): Promise<ICharacter | undefined>;
  findAll(data: IFindAllCharactersDTO): Promise<IFindAllCharactersResponseDTO>;
  findByMovieId(movie_id: number): Promise<Array<ICharacter & { role_type?: string; appeared_in?: string }>>;
  findByTVShowId(tvshow_id: number): Promise<Array<ICharacter & { role_type?: string; appeared_in?: string }>>;
  findMoviesByCharacterId(character_id: number): Promise<Array<IMovie & { role_type?: string; appeared_in?: string }>>;
  findTVShowsByCharacterId(character_id: number): Promise<Array<ITVShow & { role_type?: string; appeared_in?: string }>>;
  delete(id: number): Promise<void>;
  getStats(): Promise<IRepositoryStatsDTO>;
}
