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
import { RegisterUserUseCase } from './usecases/register-user.usecase';
import { LoginUserUseCase } from './usecases/login-user.usecase';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { AuthResponseDTO } from './dto/auth-response.dto';
import { UserResponseDTO } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
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
  async getProfile(@Request() req): Promise<UserResponseDTO> {
    return UserResponseDTO.create(req.user);
  }

  @Post('refresh')
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
