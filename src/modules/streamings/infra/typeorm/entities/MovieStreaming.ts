import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import IMovieStreaming from '@modules/streamings/entities/IMovieStreaming';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('movie_streamings')
class MovieStreaming implements IMovieStreaming {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ select: false })
  movie_id: number;

  @ManyToOne(() => Movie, movie => movie.streamings)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Column()
  platform: string;

  @Column()
  url: string;
}

export default MovieStreaming;
