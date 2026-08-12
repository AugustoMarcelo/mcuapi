import { injectable, inject } from 'tsyringe';
import IPeopleRepository from '../repositories/IPeopleRepository';
import IPersonTitleDTO from '../dtos/IPersonTitleDTO';
import AppError from '@shared/errors/AppError';

@injectable()
class GetTitlesByPersonService {
  constructor(
    @inject('PeopleRepository')
    private peopleRepository: IPeopleRepository,
  ) {}

  public async execute(person_id: number): Promise<IPersonTitleDTO[]> {
    const person = await this.peopleRepository.findById(person_id);

    if (!person) {
      throw new AppError('Person not found', 404);
    }

    return this.peopleRepository.findTitlesByPersonId(person_id);
  }
}

export default GetTitlesByPersonService;
