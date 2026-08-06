import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import IStreamingAvailability from '@modules/streaming/entities/IStreamingAvailability';

@Entity({ name: 'streaming_availability', schema: 'public' })
class StreamingAvailability implements IStreamingAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { nullable: true })
  movie_id: number | null;

  @Column('int', { nullable: true })
  tvshow_id: number | null;

  @Column('varchar', { length: 2 })
  region: string;

  @Column('varchar', { length: 60 })
  provider: string;

  @Column('varchar', { nullable: true })
  url: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id', referencedColumnName: 'id' })
  movie: Movie;

  @ManyToOne(() => TVShow)
  @JoinColumn({ name: 'tvshow_id', referencedColumnName: 'id' })
  tvshow: TVShow;
}

export default StreamingAvailability;
