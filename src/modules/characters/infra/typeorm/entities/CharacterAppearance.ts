import ICharacterAppearance from '@modules/characters/entities/ICharacterAppearance';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Character from './Character';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';

@Entity({ name: 'character_appearances', schema: 'public' })
class CharacterAppearance implements ICharacterAppearance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  character_id: number;

  @Column('int', { nullable: true })
  movie_id: number;

  @Column('int', { nullable: true })
  tvshow_id: number;

  @Column('varchar', { nullable: true })
  role_type: string;

  @Column('varchar', { nullable: true })
  multiverse_designation: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id', referencedColumnName: 'id' })
  character: Character;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id', referencedColumnName: 'id' })
  movie: Movie;

  @ManyToOne(() => TVShow)
  @JoinColumn({ name: 'tvshow_id', referencedColumnName: 'id' })
  tvshow: TVShow;

  @CreateDateColumn()
  created_at: Date;
}

export default CharacterAppearance; 