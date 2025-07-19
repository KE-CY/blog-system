import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Put(':id/profile')
  updateProfile(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to update this profile.',
      );
    }

    const updatedUser = this.usersService.update(user.id, updateUserDto);
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
}
