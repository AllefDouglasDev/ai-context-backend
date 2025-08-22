import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDTO {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  static create(data: RefreshTokenDTO): RefreshTokenDTO {
    return Object.assign(new this(), data);
  }
}
