import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Person from './Person';
import Character from '@modules/characters/infra/typeorm/entities/Character';

@Entity({ name: 'person_characters', schema: 'public' })
class PersonCharacter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  person_id: number;

  @Column('int')
  character_id: number;

  @Column('int')
  recast_order: number;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id', referencedColumnName: 'id' })
  person: Person;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id', referencedColumnName: 'id' })
  character: Character;

  @CreateDateColumn()
  created_at: Date;
}

export default PersonCharacter;
