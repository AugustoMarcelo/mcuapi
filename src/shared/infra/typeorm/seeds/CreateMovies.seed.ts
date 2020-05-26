import { Seeder, Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import data from '../factories/movies.factory';

export default class CreateMovies implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values(data)
      .execute();
  }
}
