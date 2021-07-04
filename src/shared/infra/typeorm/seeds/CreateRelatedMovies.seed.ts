import { Seeder, Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import relatedMovies from '@shared/infra/typeorm/factories/relatedMovies.factory';

export default class CreateRelatedMovies implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into('related_movies')
      .values(relatedMovies)
      .execute();
  }
}
