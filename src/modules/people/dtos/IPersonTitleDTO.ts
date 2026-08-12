import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';

type IPersonTitleDTO = (IMovie | ITVShow) & {
  type: 'movie' | 'tvshow';
  role: string;
};

export default IPersonTitleDTO;
