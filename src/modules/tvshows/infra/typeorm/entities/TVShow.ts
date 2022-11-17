import TVShowStreaming from '@modules/streamings/infra/typeorm/entities/TVShowStreaming';
import ITVShow from '@modules/tvshows/entities/ITVShow';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

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
  season: number;

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

  @OneToMany(() => TVShowStreaming, streaming => streaming.tvshow)
  streamings?: TVShowStreaming[];
}

export default TVShow;
