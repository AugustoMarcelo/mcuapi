import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import IMovie from '@modules/movies/entities/IMovie';

@Entity('movies')
class Movie implements IMovie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  release_date: Date;

  @Column()
  box_office: number;

  @Column()
  duration: number;

  @Column()
  overview: string;

  @Column()
  cover_url: string;

  @Column()
  directed_by: string;

  @Column()
  phase: number;

  @Column()
  saga: string;

  @Column()
  chronology: number;

  @Column({ default: 0 })
  post_credit_scenes: number;
}

export default Movie;
