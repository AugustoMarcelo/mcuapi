import ICharacter from '../entities/ICharacter';

export default interface IFindAllCharactersResponseDTO {
  data: ICharacter[];
  total: number;
} 