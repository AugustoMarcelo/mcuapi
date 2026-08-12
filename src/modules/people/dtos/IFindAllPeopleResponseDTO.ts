import IPerson from '../entities/IPerson';

export default interface IFindAllPeopleResponseDTO {
  data: IPerson[];
  total: number;
}
