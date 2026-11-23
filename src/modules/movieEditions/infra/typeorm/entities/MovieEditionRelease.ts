import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import MovieEdition from './MovieEdition';

@Entity({ name: 'movie_edition_releases' })
export default class MovieEditionRelease {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  edition_id: number;

  @Column('varchar')
  channel: string;

  @Column('date')
  release_date: Date;

  @ManyToOne(() => MovieEdition, edition => edition.releases)
  @JoinColumn({ name: 'edition_id' })
  edition: MovieEdition;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
