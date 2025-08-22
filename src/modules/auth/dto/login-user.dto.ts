import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  static create(data: LoginUserDTO): LoginUserDTO {
    return Object.assign(new this(), data);
  }
}
