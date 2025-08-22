import { User } from './user.entity';

describe('User Entity', () => {
  describe('Constructor', () => {
    it('should create a user with valid props', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(user.id).toBeDefined();
      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.password).toBe('password123');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user with provided id and dates', () => {
      const now = new Date();
      const providedId = '550e8400-e29b-41d4-a716-446655440000';
      const user = new User({
        id: providedId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        createdAt: now,
        updatedAt: now,
      });

      expect(user.id).toBe(providedId);
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        new User({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });
      }).toThrow('Invalid email format');
    });

    it('should throw error for invalid name', () => {
      expect(() => {
        new User({
          name: '',
          email: 'john@example.com',
          password: 'password123',
        });
      }).toThrow('Name must have at least 2 characters');

      expect(() => {
        new User({
          name: 'J',
          email: 'john@example.com',
          password: 'password123',
        });
      }).toThrow('Name must have at least 2 characters');
    });
  });

  describe('changeEmail', () => {
    it('should change email when valid', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const oldUpdatedAt = user.updatedAt;

      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        user.changeEmail('newemail@example.com');
        expect(user.email).toBe('newemail@example.com');
        expect(user.updatedAt.getTime()).toBeGreaterThan(
          oldUpdatedAt.getTime(),
        );
      }, 1);
    });

    it('should throw error for invalid email', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(() => {
        user.changeEmail('invalid-email');
      }).toThrow('Invalid email format');
    });
  });

  describe('changeName', () => {
    it('should change name when valid', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      user.changeName('Jane Doe');
      expect(user.name).toBe('Jane Doe');
    });

    it('should trim whitespace when changing name', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      user.changeName('  Jane Doe  ');
      expect(user.name).toBe('Jane Doe');
    });

    it('should throw error for invalid name', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(() => {
        user.changeName('');
      }).toThrow('Name must have at least 2 characters');

      expect(() => {
        user.changeName('J');
      }).toThrow('Name must have at least 2 characters');
    });
  });

  describe('changePassword', () => {
    it('should change password when valid', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      user.changePassword('newpassword123');
      expect(user.password).toBe('newpassword123');
    });

    it('should throw error for short password', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(() => {
        user.changePassword('123');
      }).toThrow('Password must have at least 6 characters');

      expect(() => {
        user.changePassword('');
      }).toThrow('Password must have at least 6 characters');
    });
  });

  describe('toJSON', () => {
    it('should return user data without password', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const json = user.toJSON();

      expect(json).toEqual({
        id: user.id,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      expect('password' in json).toBe(false);
    });
  });
});
