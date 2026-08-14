import IPostCreditScene from '../entities/IPostCreditScene';

export default interface IFindAllPostCreditScenesResponseDTO {
  data: IPostCreditScene[];
  total: number;
}
