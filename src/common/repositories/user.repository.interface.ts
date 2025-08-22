import { User } from '../entities/user.entity';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface UserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  findAll(options: PaginationOptions): Promise<PaginatedResult<User>>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
