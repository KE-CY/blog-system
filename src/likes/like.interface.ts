export interface Like {
  id: string;
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface LikeStatus {
  isLiked: boolean;
  totalLikes: number;
}
