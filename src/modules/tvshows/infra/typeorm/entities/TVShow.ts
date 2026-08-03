import ITVShow from '@modules/tvshows/entities/ITVShow';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tvshows', schema: 'public' })
class TVShow implements ITVShow {
  @PrimaryColumn('int')
  id: number;

  @Column('varchar')
  title: string;

  @Column('date')
  release_date: Date;

  @Column('date')
  last_aired_date: Date;

  @Column('int')
  season: number;

  @Column('int')
  number_episodes: number;

  @Column('text')
  overview: string;

  @Column('varchar')
  cover_url: string;

  @Column('varchar')
  trailer_url: string;

  @Column('varchar')
  directed_by: string;

  @Column('int')
  phase: number;

  @Column('varchar')
  saga: string;

  @Column('int')
  chronology: number;

  @Column('varchar')
  imdb_id: string;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  // Multiverse fields
  @Column('varchar', { nullable: true })
  studio: string;

  @Column('varchar', { nullable: true, default: 'MCU' })
  continuity: string;

  @Column('varchar', { nullable: true })
  multiverse_designation: string;

  @Column('boolean', { default: true })
  is_mcu: boolean;

  @Column('varchar', { default: 'tvshow' })
  type: string;

  // Timeline fields
  @Column('int', { nullable: true })
  timeline_chronology_order: number;

  @ManyToMany(() => Movie, movie => movie.related_tvshows)
  related_movies?: Movie[];

  @ManyToMany(() => TVShow)
  @JoinTable({
    name: 'related_tvshows',
    joinColumns: [{ name: 'tvshow_id' }],
    inverseJoinColumns: [{ name: 'related_tvshow_id' }],
  })
  related_tvshows?: TVShow[];
}

export default TVShow;
