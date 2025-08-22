export class AuthResponseDTO {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };

  static create(data: AuthResponseDTO): AuthResponseDTO {
    return Object.assign(new this(), data);
  }
}
