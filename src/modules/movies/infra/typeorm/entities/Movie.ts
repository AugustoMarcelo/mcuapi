import IMovie from '@modules/movies/entities/IMovie';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'movies', schema: 'public' })
class Movie implements IMovie {
  @PrimaryColumn('int')
  id: number;

  @Column('varchar')
  title: string;

  @Column('date')
  release_date: Date;

  @Column('int')
  box_office: number;

  @Column('int')
  duration: number;

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

  @Column('int', { default: 0 })
  post_credit_scenes: number;

  @Column('varchar')
  imdb_id: string;

  // Multiverse fields
  @Column('varchar', { nullable: true })
  studio: string;

  @Column('varchar', { nullable: true, default: 'MCU' })
  continuity: string;

  @Column('varchar', { nullable: true })
  multiverse_designation: string;

  @Column('boolean', { default: true })
  is_mcu: boolean;

  @Column('varchar', { default: 'movie' })
  type: string;

  // Timeline fields
  @Column('varchar', { nullable: true })
  timeline_universe: string;

  @Column('int', { nullable: true })
  timeline_chronology_order: number;

  @Column('varchar', { nullable: true })
  timeline_starts_at: string;

  @Column('varchar', { nullable: true })
  timeline_ends_at: string;

  @ManyToMany(() => Movie)
  @JoinTable({
    name: 'related_movies',
    joinColumns: [{ name: 'movie_id' }],
    inverseJoinColumns: [{ name: 'related_movie_id' }],
  })
  related_movies?: Movie[];

  @ManyToMany(() => TVShow)
  @JoinTable({
    name: 'related_content',
    joinColumns: [{ name: 'movie_id' }],
    inverseJoinColumns: [{ name: 'tvshow_id' }],
  })
  related_tvshows?: TVShow[];

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}

export default Movie;
