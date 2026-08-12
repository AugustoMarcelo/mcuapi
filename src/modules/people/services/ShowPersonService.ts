import { injectable, inject } from 'tsyringe';
import IPeopleRepository from '../repositories/IPeopleRepository';
import IPerson from '../entities/IPerson';
import AppError from '@shared/errors/AppError';

@injectable()
class ShowPersonService {
  constructor(
    @inject('PeopleRepository')
    private peopleRepository: IPeopleRepository,
  ) {}

  public async execute({ person_id }: { person_id: number }): Promise<IPerson> {
    const person = await this.peopleRepository.findById(person_id);

    if (!person) {
      throw new AppError('Person not found', 404);
    }

    return person;
  }
}

export default ShowPersonService;
