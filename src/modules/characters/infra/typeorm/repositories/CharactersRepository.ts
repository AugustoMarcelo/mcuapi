import { Repository, getRepository, Raw, Not, IsNull } from 'typeorm';

import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import ICharactersRepository from '@modules/characters/repositories/ICharactersRepository';
import ICreateCharacterDTO from '@modules/characters/dtos/ICreateCharacterDTO';
import IFindAllCharactersDTO from '@modules/characters/dtos/IFindAllCharactersDTO';
import IFindAllCharactersResponseDTO from '@modules/characters/dtos/IFindAllCharactersResponseDTO';
import IRepositoryStatsDTO from '@shared/dtos/IRepositoryStatsDTO';
import Character from '../entities/Character';
import CharacterAppearance from '../entities/CharacterAppearance';

/**
 * Which reality a character was actually in for a given title.
 *
 * Almost always the title's own — a character in The Fantastic Four: First
 * Steps is in Earth-828 because that is where the film happens. The per-appearance
 * value only exists for the exceptions, like the Void sequences in Deadpool &
 * Wolverine, so null falls back to the title rather than to the character's origin.
 */
function resolveAppearedIn(
  appearanceDesignation?: string,
  titleDesignation?: string,
): string | undefined {
  return appearanceDesignation ?? titleDesignation ?? undefined;
}

class CharactersRepository implements ICharactersRepository {
  private ormRepository: Repository<Character>;

  constructor() {
    this.ormRepository = getRepository(Character);
  }

  public async create(data: ICreateCharacterDTO): Promise<Character> {
    const character = this.ormRepository.create(data);

    await this.ormRepository.save(character);

    return character;
  }

  public async update(character: Character): Promise<Character> {
    return this.ormRepository.save(character);
  }

  public async findById(id: number): Promise<Character | undefined> {
    const findCharacter = await this.ormRepository.findOne(id);

    return findCharacter;
  }

  public async findAll({
    page,
    limit,
    columns,
    order,
    filter,
    continuity,
    multiverse_designation,
  }: IFindAllCharactersDTO): Promise<IFindAllCharactersResponseDTO> {
    const skip = page && limit && (page - 1) * limit;

    const select = columns
      ?.split(',')
      .map(column => column.trim()) as (keyof Character)[];

    const [columnOrder, sortingOrder = 'ASC'] = order
      ? order.split(',').map(item => item.trim())
      : [];

    const [columnWhere, whereValue] = filter
      ? filter.split('=').map(item => item.trim())
      : [];

    const columnsWithNumericValues = [
      'id',
      'variant_of',
      'first_appearance_movie_id',
      'first_appearance_tvshow_id',
    ];
    let formattedColumnValue;
    formattedColumnValue = Raw(alias => `${alias} ILIKE :value`, {
      value: `%${whereValue}%`,
    });

    if (columnsWithNumericValues.includes(columnWhere)) {
      formattedColumnValue = whereValue;
    }

    const whereConditions: any = {};

    if (columnWhere) {
      whereConditions[columnWhere] = formattedColumnValue;
    }

    if (continuity) {
      whereConditions.continuity = continuity;
    }

    if (multiverse_designation) {
      whereConditions.multiverse_designation = multiverse_designation;
    }

    const where =
      Object.keys(whereConditions).length > 0 ? whereConditions : undefined;

    const [characters, total] = await this.ormRepository.findAndCount({
      ...(limit && { take: limit }),
      ...(skip && { skip }),
      ...(select && { select }),
      ...(where && { where }),
      ...(columnOrder && {
        order: { [columnOrder]: sortingOrder.toUpperCase() },
      }),
    });

    return { data: characters, total };
  }

  public async findByMovieId(
    movie_id: number,
  ): Promise<Array<Character & { role_type?: string; appeared_in?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { movie_id },
      relations: ['character', 'movie'],
    });

    return appearances.map(appearance => ({
      ...appearance.character,
      role_type: appearance.role_type,
      appeared_in: resolveAppearedIn(
        appearance.multiverse_designation,
        appearance.movie?.multiverse_designation,
      ),
    }));
  }

  public async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  public async findByTVShowId(
    tvshow_id: number,
  ): Promise<Array<Character & { role_type?: string; appeared_in?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { tvshow_id },
      relations: ['character', 'tvshow'],
    });

    return appearances.map(appearance => ({
      ...appearance.character,
      role_type: appearance.role_type,
      appeared_in: resolveAppearedIn(
        appearance.multiverse_designation,
        appearance.tvshow?.multiverse_designation,
      ),
    }));
  }

  public async findMoviesByCharacterId(
    character_id: number,
  ): Promise<Array<IMovie & { role_type?: string; appeared_in?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { character_id, movie_id: Not(IsNull()) },
      relations: ['movie'],
    });

    return appearances.map(appearance => ({
      ...appearance.movie,
      role_type: appearance.role_type,
      appeared_in: resolveAppearedIn(
        appearance.multiverse_designation,
        appearance.movie?.multiverse_designation,
      ),
    }));
  }

  public async findTVShowsByCharacterId(
    character_id: number,
  ): Promise<Array<ITVShow & { role_type?: string; appeared_in?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { character_id, tvshow_id: Not(IsNull()) },
      relations: ['tvshow'],
    });

    return appearances.map(appearance => ({
      ...appearance.tvshow,
      role_type: appearance.role_type,
      appeared_in: resolveAppearedIn(
        appearance.multiverse_designation,
        appearance.tvshow?.multiverse_designation,
      ),
    }));
  }

  public async getStats(): Promise<IRepositoryStatsDTO> {
    const { count, last_updated } = await this.ormRepository
      .createQueryBuilder('character')
      .select('COUNT(*)', 'count')
      .addSelect('MAX(character.updated_at)', 'last_updated')
      .getRawOne();

    const designationRows: Array<{ multiverse_designation: string }> =
      await this.ormRepository
        .createQueryBuilder('character')
        .select(
          'DISTINCT character.multiverse_designation',
          'multiverse_designation',
        )
        .where('character.multiverse_designation IS NOT NULL')
        .getRawMany();

    return {
      count: Number(count),
      designations: designationRows.map(row => row.multiverse_designation),
      last_updated: last_updated ? new Date(last_updated) : null,
    };
  }
}

export default CharactersRepository;
