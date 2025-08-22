import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { ListUsersUseCase } from './usecases/list-users.usecase';
import { RepositoriesModule } from '../../infrastructure/repositories/repositories.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [UsersController],
  providers: [ListUsersUseCase],
  exports: [ListUsersUseCase],
})
export class UsersModule {}
