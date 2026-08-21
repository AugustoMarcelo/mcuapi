import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import ICharacter from '@modules/characters/entities/ICharacter';
import IPerson from '@modules/people/entities/IPerson';

type ISearchHitDTO =
  | (IMovie & { type: 'movie' })
  | (ITVShow & { type: 'tvshow' })
  | (ICharacter & { type: 'character' })
  | (IPerson & { type: 'person' });

export default ISearchHitDTO;
