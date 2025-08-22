import { ListUsersUseCase } from './list-users.usecase';
import { UserRepository } from '../../../common/repositories/user.repository.interface';
import { User } from '../../../common/entities/user.entity';

describe('ListUsersUseCase', () => {
  let listUsersUseCase: ListUsersUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    };

    listUsersUseCase = new ListUsersUseCase(userRepository);
  });

  describe('execute', () => {
    it('should return paginated users successfully', async () => {
      const mockUsers = [
        new User({
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedpassword',
        }),
        new User({
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'hashedpassword',
        }),
      ];

      userRepository.findAll.mockResolvedValue({
        data: mockUsers,
        total: 50,
      });

      const input = { page: 1, limit: 10 };
      const result = await listUsersUseCase.execute(input);

      expect(result).toEqual({
        users: mockUsers,
        total: 50,
        page: 1,
        limit: 10,
      });

      expect(userRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should handle empty results', async () => {
      userRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
      });

      const input = { page: 1, limit: 10 };
      const result = await listUsersUseCase.execute(input);

      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('should handle different pagination parameters', async () => {
      const mockUsers = [
        new User({
          id: '3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          password: 'hashedpassword',
        }),
      ];

      userRepository.findAll.mockResolvedValue({
        data: mockUsers,
        total: 25,
      });

      const input = { page: 3, limit: 5 };
      const result = await listUsersUseCase.execute(input);

      expect(result).toEqual({
        users: mockUsers,
        total: 25,
        page: 3,
        limit: 5,
      });

      expect(userRepository.findAll).toHaveBeenCalledWith({
        page: 3,
        limit: 5,
      });
    });
  });
});
