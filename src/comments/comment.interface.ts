export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: string;
    username: string;
    name?: string;
  };
}

export interface UserCommentLimit {
  userId: string;
  articleId: string;
  comments: Date[];
}
