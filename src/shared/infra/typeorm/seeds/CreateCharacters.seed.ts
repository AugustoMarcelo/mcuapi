import { Seeder, Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import Character from '@modules/characters/infra/typeorm/entities/Character';
import data from '../factories/characters.factory';

export default class CreateCharacters implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Character)
      .values(data)
      .execute();
  }
} 