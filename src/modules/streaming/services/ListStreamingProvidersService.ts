import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IStreamingRepository from '../repositories/IStreamingRepository';

interface IRequest {
  region?: string;
}

interface IResponse {
  regions: string[];
  providers: string[];
}

const REGION_PATTERN = /^[A-Za-z]{2}$/;

@injectable()
class ListStreamingProvidersService {
  constructor(
    @inject('StreamingRepository')
    private streamingRepository: IStreamingRepository,
  ) {}

  public async execute({ region }: IRequest = {}): Promise<IResponse> {
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

    const [regions, providers] = await Promise.all([
      this.streamingRepository.findRegions(),
      this.streamingRepository.findProviders(normalisedRegion),
    ]);

    return { regions, providers };
  }
}

export default ListStreamingProvidersService;
