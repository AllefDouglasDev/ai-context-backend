import { RefreshTokenUseCase } from './refresh-token.usecase';
import { InMemoryUserRepository } from '../../../infrastructure/repositories/in-memory/in-memory-user.repository';
import { User } from '../../../common/entities/user.entity';

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

function buildSut() {
  const userRepository = new InMemoryUserRepository();
  const jwtService = mockJwtService as any;
  const sut = new RefreshTokenUseCase(userRepository, jwtService);
  return { sut, userRepository, jwtService };
}

describe('Auth - RefreshTokenUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRATION_TIME = '15m';
    process.env.JWT_REFRESH_EXPIRATION_TIME = '7d';
  });

  it('should refresh tokens with valid refresh token', async () => {
    const { sut, userRepository, jwtService } = buildSut();

    const user = new User({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
    });
    await userRepository.create(user);

    jwtService.verifyAsync.mockResolvedValue({
      sub: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@example.com',
    });

    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token-123')
      .mockResolvedValueOnce('new-refresh-token-123');

    const input = {
      refreshToken: 'valid-refresh-token',
    };

    const output = await sut.execute(input);

    expect(output).toEqual({
      access_token: 'new-access-token-123',
      refresh_token: 'new-refresh-token-123',
    });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', {
      secret: 'test-refresh-secret',
    });

    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
      },
      { secret: 'test-secret', expiresIn: '15m' },
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
      },
      { secret: 'test-refresh-secret', expiresIn: '7d' },
    );
  });

  it('should throw error when refresh token is invalid', async () => {
    const { sut, jwtService } = buildSut();

    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    const input = {
      refreshToken: 'invalid-refresh-token',
    };

    await expect(sut.execute(input)).rejects.toThrow(
      'Invalid or expired refresh token',
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw error when refresh token is expired', async () => {
    const { sut, jwtService } = buildSut();

    jwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

    const input = {
      refreshToken: 'expired-refresh-token',
    };

    await expect(sut.execute(input)).rejects.toThrow(
      'Invalid or expired refresh token',
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw error when user does not exist', async () => {
    const { sut, jwtService } = buildSut();

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'nonexistent-user-id',
      email: 'john@example.com',
    });

    const input = {
      refreshToken: 'valid-refresh-token',
    };

    await expect(sut.execute(input)).rejects.toThrow('User not found');
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should use default token expiration times when env vars are not set', async () => {
    const { sut, userRepository, jwtService } = buildSut();

    delete process.env.JWT_EXPIRATION_TIME;
    delete process.env.JWT_REFRESH_EXPIRATION_TIME;

    const user = new User({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
    });
    await userRepository.create(user);

    jwtService.verifyAsync.mockResolvedValue({
      sub: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@example.com',
    });

    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token-123')
      .mockResolvedValueOnce('new-refresh-token-123');

    const input = {
      refreshToken: 'valid-refresh-token',
    };

    await sut.execute(input);

    expect(jwtService.signAsync).toHaveBeenCalledWith(expect.any(Object), {
      secret: 'test-secret',
      expiresIn: '15m',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(expect.any(Object), {
      secret: 'test-refresh-secret',
      expiresIn: '7d',
    });
  });
});
