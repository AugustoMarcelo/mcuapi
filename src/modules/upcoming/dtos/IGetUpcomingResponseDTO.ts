import ITitleItemDTO from '@modules/titles/dtos/ITitleItemDTO';

export default interface IGetUpcomingResponseDTO {
  data: ITitleItemDTO[];
  total: number;
}
