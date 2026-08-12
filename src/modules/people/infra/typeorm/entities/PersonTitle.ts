import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Person from './Person';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';

@Entity({ name: 'person_titles', schema: 'public' })
class PersonTitle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  person_id: number;

  @Column('int', { nullable: true })
  movie_id: number;

  @Column('int', { nullable: true })
  tvshow_id: number;

  @Column('varchar')
  role: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id', referencedColumnName: 'id' })
  person: Person;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id', referencedColumnName: 'id' })
  movie: Movie;

  @ManyToOne(() => TVShow)
  @JoinColumn({ name: 'tvshow_id', referencedColumnName: 'id' })
  tvshow: TVShow;

  @CreateDateColumn()
  created_at: Date;
}

export default PersonTitle;
