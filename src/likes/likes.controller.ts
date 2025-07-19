import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  toggleLike(
    @Body() toggleLikeDto: ToggleLikeDto,
    @Request() req,
    @CurrentUser() user: User,
  ) {
    return this.likesService.toggleLike(toggleLikeDto.articleId, user.id);
  }
}
