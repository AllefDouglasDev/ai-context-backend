import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../common/repositories/user.repository.interface';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const payload = await this.verifyRefreshToken(input.refreshToken);
    const user = await this.getUserFromPayload(payload.sub);

    const tokens = await this.generateTokens(user.id, user.email);

    return tokens;
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  private async getUserFromPayload(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION_TIME || '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
    });

    return { access_token, refresh_token };
  }
}
