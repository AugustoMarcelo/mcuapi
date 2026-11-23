import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import MovieEdition from './MovieEdition';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';

@Entity({ name: 'movie_edition_teases' })
export default class MovieEditionTease {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  edition_id: number;

  @Column('int')
  movie_id: number;

  @ManyToOne(() => MovieEdition, edition => edition.teases)
  @JoinColumn({ name: 'edition_id' })
  edition: MovieEdition;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @CreateDateColumn()
  created_at: Date;
}
