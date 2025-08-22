import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaUserRepository } from './prisma/prisma-user.repository';
import { USER_REPOSITORY } from '../../common/repositories/user.repository.interface';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class RepositoriesModule {}
