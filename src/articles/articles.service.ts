/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  Article,
  ArticleEditHistory,
  ArticleWithMetadata,
} from './article.interface';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ArticlesService {
  private articles: Article[] = [];
  private editHistories: ArticleEditHistory[] = [];

  create(createArticleDto: CreateArticleDto, authorId: string): Article {
    const now = new Date();
    const publishTime = createArticleDto.publishTime
      ? new Date(createArticleDto.publishTime)
      : now;

    const article: Article = {
      id: uuidv4(),
      title: createArticleDto.title,
      content: createArticleDto.content,
      authorId,
      tags: createArticleDto.tags,
      publishTime,
      createdAt: now,
      updatedAt: now,
      isPublished: publishTime <= now,
    };

    this.articles.push(article);
    return article;
  }

  findAll(queryDto: QueryArticleDto = {}): {
    articles: ArticleWithMetadata[];
    total: number;
  } {
    const { page = 1, limit = 10, keyword, tag, author } = queryDto;
    const filteredArticles = this.articles.filter((article) => {
      // 只顯示已發布的文章（發布時間已到）
      if (article.publishTime > new Date()) return false;

      // 關鍵字搜尋
      if (keyword) {
        const searchText = `${article.title} ${article.content}`.toLowerCase();
        if (!searchText.includes(keyword.toLowerCase())) return false;
      }

      // 標籤篩選
      if (tag && !article.tags.includes(tag)) return false;

      // 作者篩選
      if (author && article.authorId !== author) return false;

      return true;
    });

    // 按創建時間倒序排列
    filteredArticles.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const total = filteredArticles.length;
    const startIndex = (page - 1) * limit;
    const paginatedArticles = filteredArticles.slice(
      startIndex,
      startIndex + limit,
    );

    // 加入元資料（假設的 likes 和 comments 數量）
    const articlesWithMetadata: ArticleWithMetadata[] = paginatedArticles.map(
      (article) => ({
        ...article,
        likesCount: this.getLikesCount(article.id),
        commentsCount: this.getCommentsCount(article.id),
      }),
    );

    return {
      articles: articlesWithMetadata,
      total,
    };
  }

  findOne(id: string): ArticleWithMetadata {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 檢查是否已發布
    if (article.publishTime > new Date()) {
      throw new NotFoundException('文章尚未發布');
    }

    return {
      ...article,
      likesCount: this.getLikesCount(id),
      commentsCount: this.getCommentsCount(id),
      recentComments: this.getRecentComments(id),
    };
  }

  update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    userId: string,
  ): Article {
    const articleIndex = this.articles.findIndex((a) => a.id === id);
    if (articleIndex === -1) {
      throw new NotFoundException('文章不存在');
    }

    const article = this.articles[articleIndex];
    if (article.authorId !== userId) {
      throw new ForbiddenException('您沒有權限修改此文章');
    }

    // 保存編輯歷史
    this.saveEditHistory(article, userId);

    // 更新文章
    const updatedArticle = {
      ...article,
      ...updateArticleDto,
      updatedAt: new Date(),
      publishTime: updateArticleDto.publishTime
        ? new Date(updateArticleDto.publishTime)
        : article.publishTime,
    };

    this.articles[articleIndex] = updatedArticle;
    return updatedArticle;
  }

  remove(id: string, userId: string): void {
    const articleIndex = this.articles.findIndex((a) => a.id === id);
    if (articleIndex === -1) {
      throw new NotFoundException('文章不存在');
    }

    const article = this.articles[articleIndex];
    if (article.authorId !== userId) {
      throw new ForbiddenException('您沒有權限刪除此文章');
    }

    this.articles.splice(articleIndex, 1);

    // 同時清除相關的編輯歷史
    this.editHistories = this.editHistories.filter((h) => h.articleId !== id);
  }

  getEditHistories(id: string, userId: string): ArticleEditHistory[] {
    const article = this.articles.find((a) => a.id === id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('您沒有權限查看此文章的編輯歷史');
    }

    return this.editHistories
      .filter((h) => h.articleId === id)
      .sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime());
  }

  private saveEditHistory(article: Article, userId: string): void {
    const history: ArticleEditHistory = {
      id: uuidv4(),
      articleId: article.id,
      previousTitle: article.title,
      previousContent: article.content,
      previousTags: [...article.tags],
      editedAt: new Date(),
      editedBy: userId,
    };

    this.editHistories.push(history);
  }

  private getLikesCount(articleId: string): number {
    // 這裡應該與 likes service 整合，暫時返回假資料
    return Math.floor(Math.random() * 50);
  }

  private getCommentsCount(articleId: string): number {
    // 這裡應該與 comments service 整合，暫時返回假資料
    return Math.floor(Math.random() * 20);
  }

  private getRecentComments(articleId: string) {
    // 這裡應該與 comments service 整合，暫時返回假資料
    return Array.from(
      { length: Math.min(5, Math.floor(Math.random() * 8)) },
      (_, i) => ({
        id: uuidv4(),
        content: `這是第 ${i + 1} 則留言內容`,
        authorName: `User${i + 1}`,
        createdAt: new Date(),
      }),
    );
  }
}
