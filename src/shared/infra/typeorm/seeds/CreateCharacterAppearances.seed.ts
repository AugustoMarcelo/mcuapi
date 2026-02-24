import { Seeder, Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import CharacterAppearance from '@modules/characters/infra/typeorm/entities/CharacterAppearance';
import data from '../factories/character-appearances.factory';

export default class CreateCharacterAppearances implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(CharacterAppearance)
      .values(data)
      .execute();
  }
} 