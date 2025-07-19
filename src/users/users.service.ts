import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: Map<string, User> = new Map();

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (this.findByUsername(createUserDto.username)) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new User({
      id: this.generateId(),
      username: createUserDto.username,
      email: createUserDto.email || '',
      password: hashedPassword,
      name: createUserDto.name || createUserDto.username,
      bio: createUserDto.bio || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.set(user.id, user);
    return this.sanitizeUser(user);
  }

  findByUsername(username: string): User | undefined {
    const users = Array.from(this.users.values());
    return users.find((user) => user.username === username);
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const filteredDto = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, value]) => value !== undefined)
    );
    Object.assign(user, {
      ...filteredDto,
      updatedAt: new Date(),
    });
    this.users.set(id, user);
    return this.sanitizeUser(user);
  }

  async validatePassword(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = this.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  private sanitizeUser(user: User): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
