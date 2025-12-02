'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, MessageCircle, Share2, Send, MoreVertical, Bookmark } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils/time';
import { showToast } from '@/lib/utils/toast';
import { QuickBookModal } from '@/components/booking/quick-book-modal';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  user_id: string;
  username: string;
  avatar?: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_liked: boolean;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const postId = params.id as string;

  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch post
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get(`/social/posts/${postId}`);
      return response.data;
    },
  });

  // Fetch comments
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await api.get(`/social/posts/${postId}/comments`);
      return response.data || [];
    },
  });

  // Initialize liked/saved state
  useEffect(() => {
    if (post) {
      setLiked(post.user_liked || false);
      setSaved(post.user_saved || false);
      setLikesCount(post.likes_count || 0);
    }
  }, [post]);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await api.post(`/social/posts/${postId}/comment`, { content });
    },
    onSuccess: () => {
      setCommentText('');
      refetchComments();
      showToast.success('Comment added!', 'comment-added');
    },
  });

  // Like post
  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/social/posts/${postId}/like`);
        setLikesCount(prev => prev - 1);
      } else {
        await api.post(`/social/posts/${postId}/like`);
        setLikesCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  // Save post
  const handleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/social/posts/${postId}/save`);
      } else {
        await api.post(`/social/posts/${postId}/save`);
      }
      setSaved(!saved);
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId: string) => {
    try {
      await api.post(`/social/comments/${commentId}/like`);
      refetchComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by Dr. ${post?.doctor.name}`,
          text: post?.content,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-medical-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Post not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-medical-blue font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg">Post</h1>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-white border-b">
        {/* Doctor Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-gray-100">
              <AvatarImage src={post.doctor.image} alt={post.doctor.name} />
              <AvatarFallback className="bg-medical-blue text-white">
                {post.doctor.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">Dr. {post.doctor.name}</p>
              <p className="text-xs text-gray-500">{post.doctor.specialty}</p>
            </div>
          </div>
          {post.doctor.consultation_fee && (
            <Button
              onClick={() => setShowBookingModal(true)}
              className="bg-medical-blue hover:bg-blue-700 text-white rounded-lg h-9"
            >
              Book
            </Button>
          )}
        </div>

        {/* Media */}
        <div className="bg-black">
          {post.media_type === 'photo' && post.media_urls?.[0] && (
            <img
              src={post.media_urls[0]}
              alt="Post"
              className="w-full max-h-[600px] object-contain"
            />
          )}
          {post.media_type === 'video' && post.media_urls?.[0] && (
            <video
              src={post.media_urls[0]}
              controls
              className="w-full max-h-[600px] object-contain"
              poster={post.thumbnail_url}
            />
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className="focus:outline-none">
                <Heart
                  className={cn(
                    'h-7 w-7 transition-all',
                    liked ? 'fill-red-500 text-red-500' : 'text-gray-900'
                  )}
                />
              </button>
              <button className="focus:outline-none">
                <MessageCircle className="h-7 w-7 text-gray-900" />
              </button>
              <button onClick={handleShare} className="focus:outline-none">
                <Send className="h-7 w-7 text-gray-900" />
              </button>
            </div>
            <button onClick={handleSave} className="focus:outline-none">
              <Bookmark
                className={cn(
                  'h-7 w-7',
                  saved ? 'fill-gray-900 text-gray-900' : 'text-gray-900'
                )}
              />
            </button>
          </div>

          {/* Likes */}
          {likesCount > 0 && (
            <p className="font-semibold text-sm mb-2">
              {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
            </p>
          )}

          {/* Caption */}
          {post.content && (
            <p className="text-sm text-gray-900 mb-2">
              <span className="font-semibold mr-2">Dr. {post.doctor.name}</span>
              {post.content}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 uppercase">
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white mt-2">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">
            Comments ({comments?.length || 0})
          </h2>
        </div>

        {/* Comments List */}
        <div className="divide-y">
          {comments?.map((comment: Comment) => (
            <div key={comment.id} className="px-4 py-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback className="text-xs bg-gray-100">
                    {comment.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold mr-2">{comment.username}</span>
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(comment.created_at)}
                        </p>
                        {comment.likes_count > 0 && (
                          <p className="text-xs text-gray-500 font-semibold">
                            {comment.likes_count} {comment.likes_count === 1 ? 'like' : 'likes'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="p-1"
                    >
                      <Heart
                        className={cn(
                          'h-3 w-3',
                          comment.user_liked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {comments?.length === 0 && (
            <div className="px-4 py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No comments yet</p>
              <p className="text-xs text-gray-400">Be the first to comment</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Comment (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-gray-100">U</AvatarFallback>
          </Avatar>
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) {
                addCommentMutation.mutate(commentText);
              }
            }}
            className="flex-1 outline-none text-sm placeholder:text-gray-400"
          />
          {commentText.trim() && (
            <button
              onClick={() => addCommentMutation.mutate(commentText)}
              disabled={addCommentMutation.isPending}
              className="text-medical-blue font-semibold text-sm"
            >
              {addCommentMutation.isPending ? 'Posting...' : 'Post'}
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {post.doctor.consultation_fee && (
        <QuickBookModal
          doctor={{
            id: post.doctor.id,
            name: post.doctor.name,
            specialty: post.doctor.specialty,
            image: post.doctor.image,
            consultation_fee: post.doctor.consultation_fee,
            rating: post.doctor.rating,
            review_count: post.doctor.review_count,
          }}
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          source="post"
        />
      )}
    </div>
  );
}
