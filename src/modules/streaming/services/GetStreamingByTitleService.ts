import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IStreamingAvailability from '../entities/IStreamingAvailability';
import IStreamingRepository from '../repositories/IStreamingRepository';

interface IRequest {
  title_id: number;
  type: 'movie' | 'tvshow';
  region?: string;
}

/** Two letters, nothing else — the column is varchar(2). */
const REGION_PATTERN = /^[A-Za-z]{2}$/;

@injectable()
class GetStreamingByTitleService {
  constructor(
    @inject('StreamingRepository')
    private streamingRepository: IStreamingRepository,
  ) {}

  public async execute({
    title_id,
    type,
    region,
  }: IRequest): Promise<IStreamingAvailability[]> {
    if (!Number.isInteger(title_id) || title_id < 1) {
      throw new AppError('Invalid title id', 400);
    }

    let normalisedRegion: string | undefined;

    if (region !== undefined && region !== '') {
      if (!REGION_PATTERN.test(region)) {
        throw new AppError(
          'region must be a two-letter ISO 3166-1 alpha-2 code, e.g. US',
          400,
        );
      }
      normalisedRegion = region.toUpperCase();
    }

    const data = { title_id, region: normalisedRegion };

    return type === 'movie'
      ? this.streamingRepository.findByMovie(data)
      : this.streamingRepository.findByTVShow(data);
  }
}

export default GetStreamingByTitleService;
