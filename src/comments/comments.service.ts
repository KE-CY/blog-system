import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  Comment,
  CommentWithAuthor,
  UserCommentLimit,
} from './comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(private readonly userService: UserService) {}

  private comments: Comment[] = [];
  private userCommentLimits: UserCommentLimit[] = [];

  create(createCommentDto: CreateCommentDto, authorId: string): Comment {
    const { articleId, content } = createCommentDto;

    // 檢查留言頻率限制（每5分鐘最多10則留言）
    this.checkCommentLimit(authorId, articleId);

    const now = new Date();
    const comment: Comment = {
      id: uuidv4(),
      articleId,
      authorId,
      content,
      createdAt: now,
      updatedAt: now,
    };

    this.comments.push(comment);

    // 更新用戶留言記錄
    this.updateCommentLimit(authorId, articleId, now);

    return comment;
  }

  findByArticle(queryDto: QueryCommentDto): {
    comments: CommentWithAuthor[];
    total: number;
  } {
    const { articleId, page = 1, limit = 20 } = queryDto;

    const articleComments = this.comments
      .filter((comment) => comment.articleId === articleId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // 按時間正序排列

    const total = articleComments.length;
    const startIndex = (page - 1) * limit;
    const paginatedComments = articleComments.slice(
      startIndex,
      startIndex + limit,
    );

    const commentsWithAuthor: CommentWithAuthor[] = paginatedComments.map(
      (comment) => ({
        ...comment,
        author: this.getAuthor(comment.authorId),
      }),
    );

    return {
      comments: commentsWithAuthor,
      total,
    };
  }

  findById(id: string): CommentWithAuthor {
    const comment = this.comments.find((c) => c.id === id);
    if (!comment) {
      throw new NotFoundException('留言不存在');
    }

    return {
      ...comment,
      author: this.getAuthor(comment.authorId),
    };
  }

  remove(id: string, userId: string, articleAuthorId?: string): void {
    const commentIndex = this.comments.findIndex((c) => c.id === id);
    if (commentIndex === -1) {
      throw new NotFoundException('留言不存在');
    }

    const comment = this.comments[commentIndex];

    // 檢查權限：留言作者或文章作者可以刪除留言
    if (comment.authorId !== userId && articleAuthorId !== userId) {
      throw new ForbiddenException('您沒有權限刪除此留言');
    }

    this.comments.splice(commentIndex, 1);
  }

  getRecentComments(articleId: string, limit: number = 5): CommentWithAuthor[] {
    return this.comments
      .filter((comment) => comment.articleId === articleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // 最新的在前
      .slice(0, limit)
      .map((comment) => ({
        ...comment,
        author: this.getAuthor(comment.authorId),
      }));
  }

  getCommentsCount(articleId: string): number {
    return this.comments.filter((comment) => comment.articleId === articleId)
      .length;
  }

  private checkCommentLimit(userId: string, articleId: string): void {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    let userLimit = this.userCommentLimits.find(
      (limit) => limit.userId === userId && limit.articleId === articleId,
    );

    if (!userLimit) {
      userLimit = {
        userId,
        articleId,
        comments: [],
      };
      this.userCommentLimits.push(userLimit);
    }

    // 移除超過5分鐘的記錄
    userLimit.comments = userLimit.comments.filter(
      (time) => time > fiveMinutesAgo,
    );

    // 檢查是否超過限制
    if (userLimit.comments.length >= 10) {
      throw new BadRequestException('您在此文章的留言過於頻繁，請稍後再試');
    }
  }

  private updateCommentLimit(
    userId: string,
    articleId: string,
    commentTime: Date,
  ): void {
    const userLimit = this.userCommentLimits.find(
      (limit) => limit.userId === userId && limit.articleId === articleId,
    );

    if (userLimit) {
      userLimit.comments.push(commentTime);
    }
  }

  private getAuthor(authorId: string): {
    id: string;
    username: string;
    name?: string;
  } {
    const user = this.userService.getPublicUserById(authorId);
    return {
      id: user.id,
      username: user.username,
      name: user.name,
    };
  }
}
