import {
  Controller,
  Get,
  UseGuards,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ListUsersUseCase } from './usecases/list-users.usecase';
import { ListUsersResponseDTO } from './dto/list-users-response.dto';
import { PaginationQueryDTO } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly listUsersUseCase: ListUsersUseCase) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get paginated list of users',
    description:
      'Retrieve a paginated list of all users in the system. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ListUsersResponseDTO,
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Jane Smith',
            email: 'jane@example.com',
            createdAt: '2024-01-14T09:15:00.000Z',
            updatedAt: '2024-01-14T09:15:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 150,
          totalPages: 15,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid pagination parameters',
    schema: {
      type: 'object',
      properties: {
        message: {
          oneOf: [
            { type: 'string', example: 'page must be a positive number' },
            {
              type: 'array',
              items: { type: 'string' },
              example: [
                'page must be a positive number',
                'limit must not be greater than 100',
              ],
            },
          ],
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
        statusCode: {
          type: 'number',
          example: 400,
        },
      },
    },
  })
  async listUsers(
    @Query() query: PaginationQueryDTO,
  ): Promise<ListUsersResponseDTO> {
    try {
      const { page = 1, limit = 10 } = query;

      const result = await this.listUsersUseCase.execute({ page, limit });

      return ListUsersResponseDTO.create(
        result.users,
        result.page,
        result.limit,
        result.total,
      );
    } catch (error) {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
