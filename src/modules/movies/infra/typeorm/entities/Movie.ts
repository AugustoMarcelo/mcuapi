import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import IMovie from '@modules/movies/entities/IMovie';

@Entity('movies')
class Movie implements IMovie {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column('date')
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
  trailer_url: string;

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

  @Column()
  imdb_id: string;

  @ManyToMany(() => Movie)
  @JoinTable({
    name: 'related_movies',
    joinColumns: [{ name: 'movie_id' }],
    inverseJoinColumns: [{ name: 'related_movie_id' }],
  })
  related_movies?: Movie[];
}

export default Movie;
