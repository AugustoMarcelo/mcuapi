import ICharacter from '@modules/characters/entities/ICharacter';
import ICharactersRepository from '@modules/characters/repositories/ICharactersRepository';
import ICreateCharacterDTO from '@modules/characters/dtos/ICreateCharacterDTO';
import IFindAllCharactersDTO from '@modules/characters/dtos/IFindAllCharactersDTO';
import IFindAllCharactersResponseDTO from '@modules/characters/dtos/IFindAllCharactersResponseDTO';
import IMovie from '@modules/movies/entities/IMovie';
import ITVShow from '@modules/tvshows/entities/ITVShow';

interface IFakeAppearance {
  character_id: number;
  movie?: IMovie;
  tvshow?: ITVShow;
  role_type?: string;
}

class FakeCharactersRepository implements ICharactersRepository {
  private characters: ICharacter[] = [];

  private appearances: IFakeAppearance[] = [];

  public seedAppearance(appearance: IFakeAppearance): void {
    this.appearances.push(appearance);
  }

  public async create(data: ICreateCharacterDTO): Promise<ICharacter> {
    const character: ICharacter = {
      id: this.characters.length + 1,
      name: data.name,
      alias: data.alias || undefined,
      description: data.description || undefined,
      image_url: data.image_url || undefined,
      continuity: data.continuity || 'MCU',
      multiverse_designation: data.multiverse_designation || undefined,
      variant_of: data.variant_of || undefined,
      first_appearance_movie_id: data.first_appearance_movie_id || undefined,
      first_appearance_tvshow_id: data.first_appearance_tvshow_id || undefined,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.characters.push(character);

    return character;
  }

  public async findById(id: number): Promise<ICharacter | undefined> {
    const character = this.characters.find(char => char.id === id);
    return character;
  }

  public async findAll(data: IFindAllCharactersDTO): Promise<IFindAllCharactersResponseDTO> {
    const { page = 1, limit = 10, continuity, multiverse_designation, filter } = data;
    let filteredCharacters = [...this.characters];

    // Apply filters
    if (continuity) {
      filteredCharacters = filteredCharacters.filter(char => char.continuity === continuity);
    }

    if (multiverse_designation) {
      filteredCharacters = filteredCharacters.filter(char => char.multiverse_designation === multiverse_designation);
    }

    if (filter) {
      const [field, value] = filter.split('=');
      filteredCharacters = filteredCharacters.filter(char => {
        const charValue = char[field as keyof ICharacter];
        return charValue && String(charValue).toLowerCase().includes(value.toLowerCase());
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCharacters = filteredCharacters.slice(startIndex, endIndex);

    return {
      data: paginatedCharacters,
      total: filteredCharacters.length,
    };
  }

  public async update(character: ICharacter): Promise<ICharacter> {
    const characterIndex = this.characters.findIndex(char => char.id === character.id);

    if (characterIndex === -1) {
      throw new Error('Character not found');
    }

    this.characters[characterIndex] = {
      ...this.characters[characterIndex],
      ...character,
      updated_at: new Date(),
    };

    return this.characters[characterIndex];
  }

  public async findByMovieId(
    movie_id: number,
  ): Promise<Array<ICharacter & { role_type?: string; appeared_in?: string }>> {
    return this.characters
      .filter(character => character.first_appearance_movie_id === movie_id)
      .map(character => ({ ...character, role_type: 'main' }));
  }

  public async delete(id: number): Promise<void> {
    const index = this.characters.findIndex(char => char.id === id);
    if (index !== -1) {
      this.characters.splice(index, 1);
    }
  }

  public async findByTVShowId(
    tvshow_id: number,
  ): Promise<Array<ICharacter & { role_type?: string; appeared_in?: string }>> {
    return this.characters
      .filter(character => character.first_appearance_tvshow_id === tvshow_id)
      .map(character => ({ ...character, role_type: 'main' }));
  }

  public async findMoviesByCharacterId(
    character_id: number,
  ): Promise<Array<IMovie & { role_type?: string; appeared_in?: string }>> {
    return this.appearances
      .filter(appearance => appearance.character_id === character_id && appearance.movie)
      .map(appearance => ({ ...(appearance.movie as IMovie), role_type: appearance.role_type }));
  }

  public async findTVShowsByCharacterId(
    character_id: number,
  ): Promise<Array<ITVShow & { role_type?: string; appeared_in?: string }>> {
    return this.appearances
      .filter(appearance => appearance.character_id === character_id && appearance.tvshow)
      .map(appearance => ({ ...(appearance.tvshow as ITVShow), role_type: appearance.role_type }));
  }

}

export default FakeCharactersRepository; 
