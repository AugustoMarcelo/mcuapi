import IUpcomingItemDTO from './IUpcomingItemDTO';

export default interface IGetUpcomingResponseDTO {
  data: IUpcomingItemDTO[];
  total: number;
}
