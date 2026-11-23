import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import MovieEditionRelease from './MovieEditionRelease';
import MovieEditionTease from './MovieEditionTease';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';

@Entity({ name: 'movie_editions' })
export default class MovieEdition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  movie_id: number;

  @Column('varchar')
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @OneToMany(() => MovieEditionRelease, release => release.edition)
  releases: MovieEditionRelease[];

  @OneToMany(() => MovieEditionTease, tease => tease.edition)
  teases: MovieEditionTease[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
