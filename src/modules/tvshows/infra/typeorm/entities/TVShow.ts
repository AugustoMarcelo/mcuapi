import ITVShow from '@modules/tvshows/entities/ITVShow';
import { Column, Entity, PrimaryColumn } from 'typeorm';

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

  @Column()
  chronology: number;

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

  @Column('varchar', { default: 'tvshow' })
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
}

export default TVShow;
