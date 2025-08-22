import { Injectable } from '@nestjs/common';
import { User } from '../../../common/entities/user.entity';
import {
  UserRepository,
  PaginationOptions,
  PaginatedResult,
} from '../../../common/repositories/user.repository.interface';
import { PrismaService } from '../../database/prisma.service';
import { User as PrismaUser } from '../../../../generated/prisma';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: this.mapDomainToPrisma(user),
    });

    return this.mapPrismaToDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    return prismaUser ? this.mapPrismaToDomain(prismaUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    return prismaUser ? this.mapPrismaToDomain(prismaUser) : null;
  }

  async update(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id: user.id },
      data: this.mapDomainToPrisma(user),
    });

    return this.mapPrismaToDomain(prismaUser);
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const data = users.map((user) => this.mapPrismaToDomain(user));

    return { data, total };
  }

  private mapDomainToPrisma(user: User): Omit<PrismaUser, 'id'> {
    return {
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapPrismaToDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      password: prismaUser.password,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
