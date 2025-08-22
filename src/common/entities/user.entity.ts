import { IdGenerator } from './id-generator.entity';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User implements UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id || IdGenerator.generateUuid();
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.validateEmail();
    this.validateName();
  }

  private validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Invalid email format');
    }
  }

  private validateName(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Name must have at least 2 characters');
    }
  }

  changeEmail(newEmail: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('Invalid email format');
    }
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  changeName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Name must have at least 2 characters');
    }
    this.name = newName.trim();
    this.updatedAt = new Date();
  }

  changePassword(newPassword: string): void {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must have at least 6 characters');
    }
    this.password = newPassword;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
