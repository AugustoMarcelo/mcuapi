import ITVShowStreaming from '@modules/streamings/entities/ITVShowStreaming';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tvshow_streamings')
class TVShowStreaming implements ITVShowStreaming {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ select: false })
  tvshow_id: number;

  @ManyToOne(() => TVShow, tvshow => tvshow.streamings)
  @JoinColumn({ name: 'tvshow_id' })
  tvshow: TVShow;

  @Column()
  platform: string;

  @Column()
  url: string;
}

export default TVShowStreaming;
