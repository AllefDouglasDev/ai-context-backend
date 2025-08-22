import * as bcrypt from 'bcrypt';
import { LoginUserUseCase } from './login-user.usecase';
import { InMemoryUserRepository } from '../../../infrastructure/repositories/in-memory/in-memory-user.repository';
import { User } from '../../../common/entities/user.entity';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

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
  const sut = new LoginUserUseCase(userRepository, jwtService);
  return { sut, userRepository, jwtService };
}

describe('Auth - LoginUserUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRATION_TIME = '15m';
    process.env.JWT_REFRESH_EXPIRATION_TIME = '7d';
  });

  it('should login user with valid credentials', async () => {
    const { sut, userRepository, jwtService } = buildSut();

    const hashedPassword = 'hashedPassword123';
    const user = new User({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
    });
    await userRepository.create(user);

    mockedBcrypt.compare.mockResolvedValue(true as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token-123')
      .mockResolvedValueOnce('refresh-token-123');

    const input = {
      email: 'john@example.com',
      password: 'password123',
    };

    const output = await sut.execute(input);

    expect(output).toEqual({
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-123',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });

    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      'password123',
      hashedPassword,
    );
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

  it('should throw error when user does not exist', async () => {
    const { sut } = buildSut();

    const input = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    await expect(sut.execute(input)).rejects.toThrow('Invalid credentials');
    expect(mockedBcrypt.compare).not.toHaveBeenCalled();
  });

  it('should throw error when password is invalid', async () => {
    const { sut, userRepository } = buildSut();

    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
    });
    await userRepository.create(user);

    mockedBcrypt.compare.mockResolvedValue(false as never);

    const input = {
      email: 'john@example.com',
      password: 'wrongpassword',
    };

    await expect(sut.execute(input)).rejects.toThrow('Invalid credentials');
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      'wrongpassword',
      'hashedPassword123',
    );
  });

  it('should use default token expiration times when env vars are not set', async () => {
    const { sut, userRepository, jwtService } = buildSut();

    delete process.env.JWT_EXPIRATION_TIME;
    delete process.env.JWT_REFRESH_EXPIRATION_TIME;

    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
    });
    await userRepository.create(user);

    mockedBcrypt.compare.mockResolvedValue(true as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token-123')
      .mockResolvedValueOnce('refresh-token-123');

    const input = {
      email: 'john@example.com',
      password: 'password123',
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
