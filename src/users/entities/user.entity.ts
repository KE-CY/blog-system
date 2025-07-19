export class User {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
