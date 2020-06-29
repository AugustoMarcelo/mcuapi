import { injectable, inject } from 'tsyringe';
import IMoviesRepository from '../repositories/IMoviesRepository';
import IFindAllMoviesDTO from '../dtos/IFindAllMoviesDTO';
import IFindAllMoviesResponseDTO from '../dtos/IFindAllMoviesResponseDTO';

@injectable()
class ListAllMoviesService {
  constructor(
    @inject('MoviesRepository')
    private moviesRepository: IMoviesRepository,
  ) {}

  public async execute({
    page,
    limit,
    columns,
    order,
  }: IFindAllMoviesDTO): Promise<IFindAllMoviesResponseDTO> {
    const { data, total } = await this.moviesRepository.findAll({
      page,
      limit,
      columns,
      order,
    });

    return { data, total };
  }
}

export default ListAllMoviesService;
