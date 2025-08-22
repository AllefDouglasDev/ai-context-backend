import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDTO } from './user-response.dto';

export class AuthResponseDTO {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDTO,
  })
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };

  static create(data: AuthResponseDTO): AuthResponseDTO {
    return Object.assign(new this(), data);
  }
}
