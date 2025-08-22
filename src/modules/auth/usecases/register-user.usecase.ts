import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../../common/entities/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../common/repositories/user.repository.interface';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    await this.validateEmailNotExists(input.email);

    const hashedPassword = await this.hashPassword(input.password);

    const user = new User({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    const createdUser = await this.userRepository.create(user);

    return createdUser.toJSON();
  }

  private async validateEmailNotExists(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
