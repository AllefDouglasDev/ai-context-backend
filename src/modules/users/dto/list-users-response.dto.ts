import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDTO } from './user-response.dto';
import {
  PaginationMetaDTO,
  PaginatedResponseDTO,
} from '../../../common/dto/pagination.dto';

export class ListUsersResponseDTO extends PaginatedResponseDTO<UserResponseDTO> {
  @ApiProperty({
    description: 'List of users for the current page',
    type: [UserResponseDTO],
  })
  data: UserResponseDTO[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDTO,
  })
  meta: PaginationMetaDTO;

  static create(
    users: any[],
    page: number,
    limit: number,
    total: number,
  ): ListUsersResponseDTO {
    const userDTOs = users.map((user) => UserResponseDTO.create(user));
    const meta = new PaginationMetaDTO(page, limit, total);

    return {
      data: userDTOs,
      meta,
    };
  }
}
