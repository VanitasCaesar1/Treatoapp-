import { apiClient } from './client';
import {
  SocialPost,
  Comment,
  Notification,
  CreatePostInput,
  CreateCommentInput,
} from '@/lib/types/social';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Get the social feed with pagination
 */
export async function getSocialFeed(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
}): Promise<PaginatedResponse<SocialPost>> {
  return apiClient.get<PaginatedResponse<SocialPost>>('/api/social/feed', {
    params,
  });
}

/**
 * Get a specific post by ID
 */
export async function getPost(postId: string): Promise<SocialPost> {
  return apiClient.get<SocialPost>(`/api/social/posts/${postId}`);
}

/**
 * Create a new social post
 */
export async function createPost(input: CreatePostInput): Promise<SocialPost> {
  return apiClient.post<SocialPost>('/api/social/posts', input);
}

/**
 * Like or unlike a post
 */
export async function toggleLikePost(postId: string): Promise<SocialPost> {
  return apiClient.post<SocialPost>(`/api/social/posts/${postId}/like`);
}

/**
 * Save or unsave a post
 */
export async function toggleSavePost(postId: string): Promise<SocialPost> {
  return apiClient.post<SocialPost>(`/api/social/posts/${postId}/save`);
}

/**
 * Add a comment to a post
 */
export async function addComment(input: CreateCommentInput): Promise<Comment> {
  return apiClient.post<Comment>(
    `/api/social/posts/${input.postId}/comment`,
    input
  );
}

/**
 * Get comments for a post
 */
export async function getPostComments(
  postId: string,
  params?: { page?: number; pageSize?: number }
): Promise<PaginatedResponse<Comment>> {
  return apiClient.get<PaginatedResponse<Comment>>(
    `/api/social/posts/${postId}/comments`,
    { params }
  );
}

/**
 * Get notifications for the current user
 */
export async function getNotifications(params?: {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}): Promise<PaginatedResponse<Notification>> {
  return apiClient.get<PaginatedResponse<Notification>>(
    '/api/social/notifications',
    { params }
  );
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  return apiClient.post<void>(
    `/api/social/notifications/${notificationId}/read`
  );
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  return apiClient.post<void>('/api/social/notifications/read-all');
}

/**
 * Get WebSocket URL for social notifications
 */
export function getSocialWebSocketURL(): string {
  const wsBaseURL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
  return `${wsBaseURL}/api/social/ws`;
}
