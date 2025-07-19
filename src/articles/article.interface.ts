export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  publishTime: Date;
  createdAt: Date;
  updatedAt: Date;
  isPublished?: boolean;
}

export interface ArticleEditHistory {
  id: string;
  articleId: string;
  previousTitle: string;
  previousContent: string;
  previousTags: string[];
  editedAt: Date;
  editedBy: string;
}

export interface ArticleWithMetadata extends Article {
  author?: {
    id: string;
    username: string;
    name?: string;
  };
  likesCount: number;
  commentsCount: number;
  recentComments?: Array<{
    id: string;
    content: string;
    authorName: string;
    createdAt: Date;
  }>;
}
