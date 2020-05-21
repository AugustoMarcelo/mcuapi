import { uuid } from 'uuidv4';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IUser from '@modules/users/entities/IUser';
import ICreateUserDTO from '@modules/users/dtos/ICreateUserDTO';

import User from '@modules/users/infra/typeorm/entities/User';

class FakeUsersRepository implements IUsersRepository {
  private users: IUser[] = [];

  public async create(userData: ICreateUserDTO): Promise<IUser> {
    const user = new User();

    Object.assign(user, { id: uuid() }, userData);

    this.users.push(user);

    return user;
  }

  public async findByEmail(email: string): Promise<IUser | undefined> {
    const findUser = this.users.find(user => user.email === email);

    return findUser;
  }
}

export default FakeUsersRepository;
