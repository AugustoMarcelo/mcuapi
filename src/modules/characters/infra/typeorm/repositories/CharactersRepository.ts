import { Repository, getRepository, Raw, Not, IsNull } from 'typeorm';

import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import ICharactersRepository from '@modules/characters/repositories/ICharactersRepository';
import ICreateCharacterDTO from '@modules/characters/dtos/ICreateCharacterDTO';
import IFindAllCharactersDTO from '@modules/characters/dtos/IFindAllCharactersDTO';
import IFindAllCharactersResponseDTO from '@modules/characters/dtos/IFindAllCharactersResponseDTO';
import Character from '../entities/Character';
import CharacterAppearance from '../entities/CharacterAppearance';

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
    const findCharacter = await this.ormRepository.findOne(id, {
      relations: ['variant_character', 'first_appearance_movie', 'first_appearance_tvshow'],
    });

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

    const columnsWithNumericValues = ['id', 'variant_of', 'first_appearance_movie_id', 'first_appearance_tvshow_id'];
    let formattedColumnValue;
    formattedColumnValue = Raw(alias => `${alias} ILIKE :value`, { value: `%${whereValue}%` });

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

    const where = Object.keys(whereConditions).length > 0 ? whereConditions : undefined;

    const [characters, total] = await this.ormRepository.findAndCount({
      ...(limit && { take: limit }),
      ...(skip && { skip }),
      ...(select && { select }),
      ...(where && { where }),
      ...(columnOrder && {
        order: { [columnOrder]: sortingOrder.toUpperCase() },
      }),
      relations: ['variant_character', 'first_appearance_movie', 'first_appearance_tvshow'],
    });

    return { data: characters, total };
  }

  public async findByMovieId(movie_id: number): Promise<Array<Character & { role_type?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { movie_id },
      relations: ['character'],
    });

    return appearances.map(appearance => ({
      ...appearance.character,
      role_type: appearance.role_type,
    }));
  }

  public async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  public async findByTVShowId(tvshow_id: number): Promise<Array<Character & { role_type?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { tvshow_id },
      relations: ['character'],
    });

    return appearances.map(appearance => ({
      ...appearance.character,
      role_type: appearance.role_type,
    }));
  }

  public async findMoviesByCharacterId(
    character_id: number,
  ): Promise<Array<IMovie & { role_type?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { character_id, movie_id: Not(IsNull()) },
      relations: ['movie'],
    });

    return appearances.map(appearance => ({
      ...appearance.movie,
      role_type: appearance.role_type,
    }));
  }

  public async findTVShowsByCharacterId(
    character_id: number,
  ): Promise<Array<ITVShow & { role_type?: string }>> {
    const characterAppearancesRepository = getRepository(CharacterAppearance);
    const appearances = await characterAppearancesRepository.find({
      where: { character_id, tvshow_id: Not(IsNull()) },
      relations: ['tvshow'],
    });

    return appearances.map(appearance => ({
      ...appearance.tvshow,
      role_type: appearance.role_type,
    }));
  }
}

export default CharactersRepository; 
