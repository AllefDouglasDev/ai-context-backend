import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { RegisterUserUseCase } from './usecases/register-user.usecase';
import { LoginUserUseCase } from './usecases/login-user.usecase';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { AuthResponseDTO } from './dto/auth-response.dto';
import { UserResponseDTO } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDTO })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UserResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Invalid email format',
        },
        statusCode: {
          type: 'number',
          example: 400,
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email already exists',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Email already exists',
        },
        statusCode: {
          type: 'number',
          example: 409,
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async register(@Body() dto: RegisterUserDTO): Promise<UserResponseDTO> {
    try {
      const result = await this.registerUserUseCase.execute({
        name: dto.name,
        email: dto.email,
        password: dto.password,
      });
      return UserResponseDTO.create(result);
    } catch (error) {
      if (error.message === 'Email already exists') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      if (
        error.message.includes('Invalid email format') ||
        error.message.includes('Name must have at least 2 characters')
      ) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and get tokens' })
  @ApiBody({ type: LoginUserDTO })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Invalid credentials',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async login(@Body() dto: LoginUserDTO): Promise<AuthResponseDTO> {
    try {
      const result = await this.loginUserUseCase.execute({
        email: dto.email,
        password: dto.password,
      });
      return AuthResponseDTO.create(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDTO,
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
  async getProfile(@Request() req): Promise<UserResponseDTO> {
    return UserResponseDTO.create(req.user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDTO })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Invalid or expired refresh token',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async refresh(
    @Body() dto: RefreshTokenDTO,
  ): Promise<Omit<AuthResponseDTO, 'user'>> {
    try {
      const result = await this.refreshTokenUseCase.execute({
        refreshToken: dto.refreshToken,
      });
      return {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      };
    } catch (error) {
      if (
        error.message === 'Invalid or expired refresh token' ||
        error.message === 'User not found'
      ) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
