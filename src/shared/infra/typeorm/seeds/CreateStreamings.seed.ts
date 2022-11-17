import MovieStreaming from '@modules/streamings/infra/typeorm/entities/MovieStreaming';
import { movieStreamings } from '@shared/infra/typeorm/factories/streamings.factory';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateStreamings implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(MovieStreaming)
      .values(movieStreamings)
      .execute();
  }
}
