import { injectable, inject } from 'tsyringe';

import ISearchRepository from '@modules/search/repositories/ISearchRepository';
import ISearchDTO from '@modules/search/dtos/ISearchDTO';
import ISearchResponseDTO from '@modules/search/dtos/ISearchResponseDTO';
import ISearchHitDTO from '@modules/search/dtos/ISearchHitDTO';
import ISearchRankHitDTO from '@modules/search/dtos/ISearchRankHitDTO';
import IMoviesRepository from '@modules/movies/repositories/IMoviesRepository';
import ITVShowsRepository from '@modules/tvshows/repositories/ITVShowsRepository';
import ICharactersRepository from '@modules/characters/repositories/ICharactersRepository';
import IPeopleRepository from '@modules/people/repositories/IPeopleRepository';

@injectable()
class SearchService {
  constructor(
    @inject('SearchRepository')
    private searchRepository: ISearchRepository,
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
    @inject('TVShowsRepository')
    private tvshowsRepository: ITVShowsRepository,
    @inject('CharactersRepository')
    private charactersRepository: ICharactersRepository,
    @inject('PeopleRepository')
    private peopleRepository: IPeopleRepository,
  ) {}

  public async execute(data: ISearchDTO): Promise<ISearchResponseDTO> {
    const { hits, total } = await this.searchRepository.rank(data);

    const records = await Promise.all(hits.map(hit => this.hydrate(hit)));

    return {
      data: records.filter((record): record is ISearchHitDTO => !!record),
      total,
    };
  }

  private async hydrate(
    hit: ISearchRankHitDTO,
  ): Promise<ISearchHitDTO | undefined> {
    switch (hit.type) {
      case 'movie': {
        const movie = await this.moviesRepository.findById(hit.id);
        return movie ? { ...movie, type: 'movie' } : undefined;
      }
      case 'tvshow': {
        const tvshow = await this.tvshowsRepository.findById(hit.id);
        return tvshow ? { ...tvshow, type: 'tvshow' } : undefined;
      }
      case 'character': {
        const character = await this.charactersRepository.findById(hit.id);
        return character ? { ...character, type: 'character' } : undefined;
      }
      case 'person': {
        const person = await this.peopleRepository.findById(hit.id);
        return person ? { ...person, type: 'person' } : undefined;
      }
      default:
        return undefined;
    }
  }
}

export default SearchService;
