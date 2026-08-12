import { injectable, inject } from 'tsyringe';
import IPeopleRepository from '../repositories/IPeopleRepository';
import IPersonCharacterDTO from '../dtos/IPersonCharacterDTO';
import AppError from '@shared/errors/AppError';

@injectable()
class GetCharactersByPersonService {
  constructor(
    @inject('PeopleRepository')
    private peopleRepository: IPeopleRepository,
  ) {}

  public async execute(person_id: number): Promise<IPersonCharacterDTO[]> {
    const person = await this.peopleRepository.findById(person_id);

    if (!person) {
      throw new AppError('Person not found', 404);
    }

    return this.peopleRepository.findCharactersByPersonId(person_id);
  }
}

export default GetCharactersByPersonService;
