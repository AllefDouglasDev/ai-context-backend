import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDTO {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'uuid-v4-string',
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static create(data: UserResponseDTO): UserResponseDTO {
    return Object.assign(new this(), data);
  }
}
