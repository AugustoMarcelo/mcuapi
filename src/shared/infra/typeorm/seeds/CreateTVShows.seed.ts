import { Seeder, Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import TVShow from '@modules/tvshows/infra/typeorm/entities/TVShow';
import data from '../factories/tvshows.factory';

export default class CreateTVShows implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(TVShow)
      .values(data)
      .execute();
  }
}
