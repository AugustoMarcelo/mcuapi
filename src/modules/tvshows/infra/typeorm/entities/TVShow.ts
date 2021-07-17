import { Entity, PrimaryColumn, Column } from 'typeorm';
import ITVShow from '@modules/tvshows/entities/ITVShow';

@Entity('tvshows')
class TVShow implements ITVShow {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column('date')
  release_date: Date;

  @Column('date')
  last_aired_date: Date;

  @Column()
  number_seasons: number;

  @Column()
  number_episodes: number;

  @Column()
  overview: string;

  @Column()
  cover_url: string;

  @Column()
  trailer_url: string;

  @Column()
  directed_by: string;

  @Column()
  phase: number;

  @Column()
  saga: string;

  @Column()
  imdb_id: string;
}

export default TVShow;
