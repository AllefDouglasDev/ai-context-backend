import { User } from '../../../common/entities/user.entity';
import {
  UserRepository,
  PaginationOptions,
  PaginatedResult,
} from '../../../common/repositories/user.repository.interface';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    const newUser = new User({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    this.users.push(newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((user) => user.email === email);
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((user) => user.id === id);
    return user || null;
  }

  async update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      throw new Error('User not found');
    }

    const updatedUser = new User({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });

    this.users[index] = updatedUser;
    return updatedUser;
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page, limit } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const data = this.users.slice(startIndex, endIndex);
    const total = this.users.length;

    return { data, total };
  }

  clear(): void {
    this.users = [];
  }

  getAll(): User[] {
    return [...this.users];
  }
}
