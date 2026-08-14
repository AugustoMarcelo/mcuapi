import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import IPostCreditScene from '@modules/postCreditScenes/entities/IPostCreditScene';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';

@Entity({ name: 'post_credit_scenes', schema: 'public' })
class PostCreditScene implements IPostCreditScene {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { nullable: true })
  movie_id: number;

  @Column('int', { nullable: true })
  tvshow_id: number;

  @Column('text')
  description: string;

  @Column('int', { nullable: true })
  teases_movie_id: number;

  @Column('int', { nullable: true })
  teases_tvshow_id: number;

  @Column('boolean', { default: false })
  is_stinger: boolean;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id', referencedColumnName: 'id' })
  movie: Movie;

  @ManyToOne(() => TVShow)
  @JoinColumn({ name: 'tvshow_id', referencedColumnName: 'id' })
  tvshow: TVShow;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'teases_movie_id', referencedColumnName: 'id' })
  teases_movie: Movie;

  @ManyToOne(() => TVShow)
  @JoinColumn({ name: 'teases_tvshow_id', referencedColumnName: 'id' })
  teases_tvshow: TVShow;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default PostCreditScene;
