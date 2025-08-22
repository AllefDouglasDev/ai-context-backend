import { Inject, Injectable } from '@nestjs/common';
import {
  UserRepository,
  USER_REPOSITORY,
  PaginationOptions,
} from '../../../common/repositories/user.repository.interface';
import { User } from '../../../common/entities/user.entity';

interface ListUsersInput {
  page: number;
  limit: number;
}

interface ListUsersOutput {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const options: PaginationOptions = {
      page: input.page,
      limit: input.limit,
    };

    const result = await this.userRepository.findAll(options);

    return {
      users: result.data,
      total: result.total,
      page: input.page,
      limit: input.limit,
    };
  }
}
