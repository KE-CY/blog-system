import { Injectable } from '@nestjs/common';
import { Like, LikeStatus } from './like.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LikesService {
  private likes: Like[] = [];

  toggleLike(articleId: string, userId: string): LikeStatus {
    const existingLike = this.likes.find(
      (like) => like.articleId === articleId && like.userId === userId,
    );

    if (existingLike) {
      // 如果已經按讚，則取消按讚
      this.likes = this.likes.filter((like) => like.id !== existingLike.id);
      return {
        isLiked: false,
        totalLikes: this.getLikesCount(articleId),
      };
    } else {
      // 如果未按讚，則新增按讚
      const newLike: Like = {
        id: uuidv4(),
        articleId,
        userId,
        createdAt: new Date(),
      };
      this.likes.push(newLike);
      return {
        isLiked: true,
        totalLikes: this.getLikesCount(articleId),
      };
    }
  }

  getLikesCount(articleId: string): number {
    return this.likes.filter((like) => like.articleId === articleId).length;
  }
}
