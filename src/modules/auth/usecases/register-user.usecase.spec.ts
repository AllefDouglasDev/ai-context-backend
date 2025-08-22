import * as bcrypt from 'bcrypt';
import { RegisterUserUseCase } from './register-user.usecase';
import { InMemoryUserRepository } from '../../../infrastructure/repositories/in-memory/in-memory-user.repository';
import { User } from '../../../common/entities/user.entity';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function buildSut() {
  const userRepository = new InMemoryUserRepository();
  const sut = new RegisterUserUseCase(userRepository);
  return { sut, userRepository };
}

describe('Auth - RegisterUserUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
  });

  it('should register a new user successfully', async () => {
    const { sut, userRepository } = buildSut();

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const output = await sut.execute(input);

    expect(output).toEqual({
      id: expect.any(String),
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);

    const savedUser = await userRepository.findByEmail('john@example.com');
    expect(savedUser).toBeDefined();
    expect(savedUser?.password).toBe('hashedPassword123');
  });

  it('should throw error when email already exists', async () => {
    const { sut, userRepository } = buildSut();

    const existingUser = new User({
      name: 'Existing User',
      email: 'john@example.com',
      password: 'hashedPassword',
    });
    await userRepository.create(existingUser);

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await expect(sut.execute(input)).rejects.toThrow('Email already exists');
    expect(mockedBcrypt.hash).not.toHaveBeenCalled();
  });

  it('should validate user entity during creation', async () => {
    const { sut } = buildSut();

    const input = {
      name: 'J', // Invalid name (too short)
      email: 'john@example.com',
      password: 'password123',
    };

    await expect(sut.execute(input)).rejects.toThrow(
      'Name must have at least 2 characters',
    );
  });

  it('should validate email format during entity creation', async () => {
    const { sut } = buildSut();

    const input = {
      name: 'John Doe',
      email: 'invalid-email', // Invalid email format
      password: 'password123',
    };

    await expect(sut.execute(input)).rejects.toThrow('Invalid email format');
  });

  it('should hash password with correct salt rounds', async () => {
    const { sut } = buildSut();

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await sut.execute(input);

    expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
  });
});
