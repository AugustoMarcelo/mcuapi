import ICharacter from '@modules/characters/entities/ICharacter';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';

@Entity({ name: 'characters', schema: 'public' })
class Character implements ICharacter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  alias: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { nullable: true })
  image_url: string;

  @Column('varchar', { nullable: true })
  played_by: string;

  @Column('varchar', { nullable: true, default: 'MCU' })
  continuity: string;

  @Column('varchar', { nullable: true })
  multiverse_designation: string;

  @Column('int', { nullable: true })
  variant_of: number;

  @Column('int', { nullable: true })
  first_appearance_movie_id: number;

  @Column('int', { nullable: true })
  first_appearance_tvshow_id: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'variant_of', referencedColumnName: 'id' })
  variant_character: Character;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'first_appearance_movie_id', referencedColumnName: 'id' })
  first_appearance_movie: Movie;

  @ManyToOne(() => TVShow)
  @JoinColumn({ name: 'first_appearance_tvshow_id', referencedColumnName: 'id' })
  first_appearance_tvshow: TVShow;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Character; 