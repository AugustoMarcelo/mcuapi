import IPerson from '../entities/IPerson';
import IFindAllPeopleDTO from '../dtos/IFindAllPeopleDTO';
import IFindAllPeopleResponseDTO from '../dtos/IFindAllPeopleResponseDTO';
import IPersonCharacterDTO from '../dtos/IPersonCharacterDTO';
import IPersonTitleDTO from '../dtos/IPersonTitleDTO';
import IPeopleStatsDTO from '../dtos/IPeopleStatsDTO';

export default interface IPeopleRepository {
  findById(id: number): Promise<IPerson | undefined>;
  findAll(data: IFindAllPeopleDTO): Promise<IFindAllPeopleResponseDTO>;
  findCharactersByPersonId(person_id: number): Promise<IPersonCharacterDTO[]>;
  findTitlesByPersonId(person_id: number): Promise<IPersonTitleDTO[]>;
  getStats(): Promise<IPeopleStatsDTO>;
}
