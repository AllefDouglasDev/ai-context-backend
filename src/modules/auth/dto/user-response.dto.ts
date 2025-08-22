export class UserResponseDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  static create(data: UserResponseDTO): UserResponseDTO {
    return Object.assign(new this(), data);
  }
}
