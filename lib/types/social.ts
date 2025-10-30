export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  tags: string[];
  category: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'appointment' 
  | 'message';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface CreatePostInput {
  content: string;
  tags?: string[];
  category: string;
}

export interface CreateCommentInput {
  postId: string;
  content: string;
}
