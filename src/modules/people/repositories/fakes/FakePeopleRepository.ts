import IPerson from '@modules/people/entities/IPerson';
import PEOPLE_COLUMNS from '@modules/people/entities/peopleColumns';
import IPeopleRepository from '@modules/people/repositories/IPeopleRepository';
import IFindAllPeopleDTO from '@modules/people/dtos/IFindAllPeopleDTO';
import IFindAllPeopleResponseDTO from '@modules/people/dtos/IFindAllPeopleResponseDTO';
import IPersonCharacterDTO from '@modules/people/dtos/IPersonCharacterDTO';
import IPersonTitleDTO from '@modules/people/dtos/IPersonTitleDTO';
import ICharacter from '@modules/characters/entities/ICharacter';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import compareValues from '@shared/utils/compareValues';

interface IFakePersonCharacterLink {
  person_id: number;
  character: ICharacter;
  recast_order: number;
}

interface IFakePersonTitleLink {
  person_id: number;
  movie?: IMovie;
  tvshow?: ITVShow;
  role: string;
}

class FakePeopleRepository implements IPeopleRepository {
  private people: IPerson[] = [];

  private characterLinks: IFakePersonCharacterLink[] = [];

  private titleLinks: IFakePersonTitleLink[] = [];

  public seedPerson(data: { name: string }): IPerson {
    const person: IPerson = {
      id: this.people.length + 1,
      name: data.name,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.people.push(person);

    return person;
  }

  public seedCharacterLink(link: IFakePersonCharacterLink): void {
    this.characterLinks.push(link);
  }

  public seedTitleLink(link: IFakePersonTitleLink): void {
    this.titleLinks.push(link);
  }

  public async findById(id: number): Promise<IPerson | undefined> {
    return this.people.find(person => person.id === id);
  }

  public async findAll({
    page = 1,
    limit = 10,
    filter,
    order,
  }: IFindAllPeopleDTO): Promise<IFindAllPeopleResponseDTO> {
    let filteredPeople = [...this.people];

    filter?.forEach(({ column, value }) => {
      filteredPeople = filteredPeople.filter(person => {
        const personValue = person[column];

        if (personValue === undefined || personValue === null) {
          return false;
        }

        return PEOPLE_COLUMNS[column] === 'exact'
          ? String(personValue) === value
          : String(personValue).toLowerCase().includes(value.toLowerCase());
      });
    });

    if (order?.length) {
      filteredPeople = [...filteredPeople].sort((a, b) => {
        const clause = order.find(
          ({ column }) => compareValues(a[column], b[column]) !== 0,
        );

        if (!clause) return 0;

        const comparison = compareValues(a[clause.column], b[clause.column]);

        return clause.direction === 'ASC' ? comparison : -comparison;
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPeople = filteredPeople.slice(startIndex, endIndex);

    return {
      data: paginatedPeople,
      total: filteredPeople.length,
    };
  }

  public async findCharactersByPersonId(
    person_id: number,
  ): Promise<IPersonCharacterDTO[]> {
    return this.characterLinks
      .filter(link => link.person_id === person_id)
      .sort((a, b) => a.recast_order - b.recast_order)
      .map(link => ({ ...link.character, recast_order: link.recast_order }));
  }

  public async findTitlesByPersonId(
    person_id: number,
  ): Promise<IPersonTitleDTO[]> {
    const items = this.titleLinks
      .filter(link => link.person_id === person_id)
      .map(link =>
        link.movie
          ? { ...link.movie, type: 'movie' as const, role: link.role }
          : {
              ...(link.tvshow as ITVShow),
              type: 'tvshow' as const,
              role: link.role,
            },
      );

    return items.sort((a, b) => {
      const aTime = a.release_date
        ? new Date(a.release_date).getTime()
        : Infinity;
      const bTime = b.release_date
        ? new Date(b.release_date).getTime()
        : Infinity;

      return aTime - bTime;
    });
  }
}

export default FakePeopleRepository;
