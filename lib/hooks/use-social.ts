import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import {
  getSocialFeed,
  getPost,
  createPost,
  toggleLikePost,
  toggleSavePost,
  addComment,
  getPostComments,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/api/social';
import {
  SocialPost,
  Comment,
  Notification,
  CreatePostInput,
  CreateCommentInput,
} from '@/lib/types/social';
import { PaginatedResponse } from '@/lib/types/api';

/**
 * Hook to fetch the social feed with pagination
 */
export function useSocialFeed(
  params?: {
    page?: number;
    pageSize?: number;
    category?: string;
  },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<SocialPost>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['social-feed', params],
    queryFn: () => getSocialFeed(params),
    ...options,
  });
}

/**
 * Hook to fetch the social feed with infinite scroll
 */
export function useInfiniteSocialFeed(
  params?: {
    pageSize?: number;
    category?: string;
  },
  options?: Omit<
    UseInfiniteQueryOptions<PaginatedResponse<SocialPost>>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) {
  return useInfiniteQuery({
    queryKey: ['social-feed', 'infinite', params],
    queryFn: ({ pageParam }) =>
      getSocialFeed({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    ...options,
  });
}

/**
 * Hook to fetch a specific post by ID
 */
export function usePost(
  postId: string,
  options?: Omit<UseQueryOptions<SocialPost>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
    ...options,
  });
}

/**
 * Hook to create a new social post
 */
export function useCreatePost(
  options?: UseMutationOptions<SocialPost, Error, CreatePostInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      // Invalidate social feed to show the new post
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      // Set the new post in cache
      queryClient.setQueryData(['post', data.id], data);
    },
    ...options,
  });
}

/**
 * Hook to like or unlike a post
 */
export function useLikePost(
  options?: UseMutationOptions<SocialPost, Error, string, { previousPost: SocialPost | undefined }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLikePost,
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<SocialPost>(['post', postId]);

      // Optimistically update the post
      if (previousPost) {
        queryClient.setQueryData<SocialPost>(['post', postId], {
          ...previousPost,
          isLiked: !previousPost.isLiked,
          likesCount: previousPost.isLiked
            ? previousPost.likesCount - 1
            : previousPost.likesCount + 1,
        });
      }

      return { previousPost };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
    onSuccess: (data, postId) => {
      // Update with server data
      queryClient.setQueryData(['post', postId], data);
      // Invalidate feed to update like counts
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    ...options,
  });
}

/**
 * Hook to save or unsave a post
 */
export function useSavePost(
  options?: UseMutationOptions<SocialPost, Error, string, { previousPost: SocialPost | undefined }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSavePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      const previousPost = queryClient.getQueryData<SocialPost>(['post', postId]);

      if (previousPost) {
        queryClient.setQueryData<SocialPost>(['post', postId], {
          ...previousPost,
          isSaved: !previousPost.isSaved,
        });
      }

      return { previousPost };
    },
    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
    onSuccess: (data, postId) => {
      queryClient.setQueryData(['post', postId], data);
    },
    ...options,
  });
}

/**
 * Hook to add a comment to a post
 */
export function useAddComment(
  options?: UseMutationOptions<Comment, Error, CreateCommentInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addComment,
    onSuccess: (data, variables) => {
      // Invalidate comments list for the post
      queryClient.invalidateQueries({
        queryKey: ['post-comments', variables.postId],
      });
      // Invalidate the post to update comment count
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
      // Invalidate feed to update comment counts
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    ...options,
  });
}

/**
 * Hook to fetch comments for a post
 */
export function usePostComments(
  postId: string,
  params?: { page?: number; pageSize?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Comment>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['post-comments', postId, params],
    queryFn: () => getPostComments(postId, params),
    enabled: !!postId,
    ...options,
  });
}

/**
 * Hook to fetch notifications for the current user
 */
export function useNotifications(
  params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Notification>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
    ...options,
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidate notifications to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    ...options,
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead(
  options?: UseMutationOptions<void, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate notifications to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    ...options,
  });
}
