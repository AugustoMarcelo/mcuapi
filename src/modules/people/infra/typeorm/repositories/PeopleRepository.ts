import { Repository, Not, IsNull, FindOptionsWhere } from 'typeorm';

import Person from '../entities/Person';
import PersonCharacter from '../entities/PersonCharacter';
import PersonTitle from '../entities/PersonTitle';
import AppDataSource from '@shared/infra/typeorm/dataSource';
import IPeopleRepository from '@modules/people/repositories/IPeopleRepository';
import IFindAllPeopleDTO from '@modules/people/dtos/IFindAllPeopleDTO';
import IFindAllPeopleResponseDTO from '@modules/people/dtos/IFindAllPeopleResponseDTO';
import IPersonCharacterDTO from '@modules/people/dtos/IPersonCharacterDTO';
import IPersonTitleDTO from '@modules/people/dtos/IPersonTitleDTO';
import IPeopleStatsDTO from '@modules/people/dtos/IPeopleStatsDTO';
import PEOPLE_COLUMNS from '@modules/people/entities/peopleColumns';
import {
  buildOrderFromClauses,
  buildSelectFromColumns,
  buildWhereFromFilter,
  withIdTieBreaker,
} from '@shared/infra/typeorm/listParamsQuery';

class PeopleRepository implements IPeopleRepository {
  private ormRepository: Repository<Person>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Person);
  }

  public async findById(id: number): Promise<Person | undefined> {
    const person = await this.ormRepository.findOne({ where: { id } });

    return person ?? undefined;
  }

  public async findAll({
    page,
    limit,
    columns,
    order,
    filter,
  }: IFindAllPeopleDTO): Promise<IFindAllPeopleResponseDTO> {
    const skip = page && limit && (page - 1) * limit;

    const orderBy = withIdTieBreaker(buildOrderFromClauses(order));

    const whereConditions = buildWhereFromFilter(filter, PEOPLE_COLUMNS);

    const where =
      Object.keys(whereConditions).length > 0
        ? (whereConditions as FindOptionsWhere<Person>)
        : undefined;

    const select = buildSelectFromColumns(columns);

    const [people, total] = await this.ormRepository.findAndCount({
      ...(limit && { take: limit }),
      ...(skip && { skip }),
      ...(select && { select }),
      ...(where && { where }),
      order: orderBy,
    });

    return { data: people, total };
  }

  public async findCharactersByPersonId(
    person_id: number,
  ): Promise<IPersonCharacterDTO[]> {
    const personCharactersRepository =
      AppDataSource.getRepository(PersonCharacter);

    const links = await personCharactersRepository.find({
      where: { person_id },
      relations: { character: true },
      order: { recast_order: 'ASC' },
    });

    return links.map(link => ({
      ...link.character,
      recast_order: link.recast_order,
    }));
  }

  public async findTitlesByPersonId(
    person_id: number,
  ): Promise<IPersonTitleDTO[]> {
    const personTitlesRepository = AppDataSource.getRepository(PersonTitle);

    const [movieCredits, tvshowCredits] = await Promise.all([
      personTitlesRepository.find({
        where: { person_id, movie_id: Not(IsNull()) },
        relations: { movie: true },
      }),
      personTitlesRepository.find({
        where: { person_id, tvshow_id: Not(IsNull()) },
        relations: { tvshow: true },
      }),
    ]);

    const items: IPersonTitleDTO[] = [
      ...movieCredits.map(credit => ({
        ...credit.movie,
        type: 'movie' as const,
        role: credit.role,
      })),
      ...tvshowCredits.map(credit => ({
        ...credit.tvshow,
        type: 'tvshow' as const,
        role: credit.role,
      })),
    ];

    items.sort((a, b) => {
      const aTime = a.release_date
        ? new Date(a.release_date).getTime()
        : Infinity;
      const bTime = b.release_date
        ? new Date(b.release_date).getTime()
        : Infinity;

      return aTime - bTime;
    });

    return items;
  }

  public async getStats(): Promise<IPeopleStatsDTO> {
    const { count, last_updated } = await this.ormRepository
      .createQueryBuilder('person')
      .select('COUNT(*)', 'count')
      .addSelect('MAX(person.updated_at)', 'last_updated')
      .getRawOne();

    return {
      count: Number(count),
      last_updated: last_updated ? new Date(last_updated) : null,
    };
  }
}

export default PeopleRepository;
