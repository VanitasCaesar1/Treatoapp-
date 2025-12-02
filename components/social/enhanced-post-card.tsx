'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Bookmark, Send, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { QuickBookModal } from '@/components/booking/quick-book-modal';
import { api } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils/time';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Comment {
    id: string;
    user_id: string;
    username: string;
    avatar?: string;
    content: string;
    created_at: string;
}

interface EnhancedPostCardProps {
    post: {
        id: string;
        doctor: {
            id: string;
            name: string;
            specialty: string;
            image?: string;
            is_following?: boolean;
            consultation_fee?: number;
            rating?: number;
            review_count?: number;
        };
        content: string;
        media_urls: string[];
        media_type: 'photo' | 'video';
        thumbnail_url?: string;
        likes_count: number;
        comments_count: number;
        views_count?: number;
        user_liked?: boolean;
        user_saved?: boolean;
        latest_comments?: Comment[];
        created_at: string;
    };
}

export function EnhancedPostCard({ post }: EnhancedPostCardProps) {
    const [liked, setLiked] = useState(post.user_liked || false);
    const [saved, setSaved] = useState(post.user_saved || false);
    const [following, setFollowing] = useState(post.doctor.is_following || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<Comment[]>(post.latest_comments || []);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Double-tap to like
    const handleDoubleTap = async () => {
        if (!liked) {
            setLiked(true);
            setLikesCount(prev => prev + 1);
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 1000);

            try {
                await api.post(`/social/posts/${post.id}/like`);
            } catch (error) {
                setLiked(false);
                setLikesCount(prev => prev - 1);
            }
        }
    };

    // Single like toggle
    const handleLike = async () => {
        try {
            if (liked) {
                await api.delete(`/social/posts/${post.id}/like`);
                setLikesCount(prev => prev - 1);
            } else {
                await api.post(`/social/posts/${post.id}/like`);
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
                await api.delete(`/social/posts/${post.id}/save`);
            } else {
                await api.post(`/social/posts/${post.id}/save`);
            }
            setSaved(!saved);
        } catch (error) {
            console.error('Failed to save post:', error);
        }
    };

    // Follow doctor
    const handleFollow = async () => {
        try {
            if (following) {
                await api.delete(`/doctors/${post.doctor.id}/follow`);
            } else {
                await api.post(`/doctors/${post.doctor.id}/follow`);
            }
            setFollowing(!following);
        } catch (error) {
            console.error('Failed to follow:', error);
        }
    };

    // Add comment
    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            const response = await api.post(`/social/posts/${post.id}/comment`, {
                content: commentText,
            });

            setComments([response.comment, ...comments]);
            setCommentText('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by Dr. ${post.doctor.name}`,
                    text: post.content,
                    url: window.location.origin + `/post/${post.id}`,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        }
    };

    const captionTruncated = post.content && post.content.length > 100;
    const displayCaption = showFullCaption || !captionTruncated
        ? post.content
        : post.content?.substring(0, 100) + '...';

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Header - Doctor Info + Follow */}
            <div className="flex items-center justify-between px-3 py-2.5">
                <Link href={`/search/${post.doctor.id}`}>
                    <div className="flex items-center gap-2.5 cursor-pointer">
                        <Avatar className="h-8 w-8 ring-1 ring-gray-100">
                            <AvatarImage src={post.doctor.image} alt={post.doctor.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-medical-blue text-xs font-semibold">
                                {post.doctor.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm text-gray-900">Dr. {post.doctor.name}</p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">{post.doctor.specialty}</p>
                        </div>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    {!following && (
                        <button
                            onClick={handleFollow}
                            className="text-medical-blue font-semibold text-xs px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                            Follow
                        </button>
                    )}
                    {post.doctor.consultation_fee && (
                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="flex items-center gap-1.5 bg-medical-blue text-white font-semibold text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Calendar className="h-3 w-3" />
                            Book
                        </button>
                    )}
                    <button className="p-1.5 hover:bg-gray-50 rounded-full transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Media - Double tap to like */}
            <div
                className="relative bg-blackselect-none"
                onDoubleClick={handleDoubleTap}
            >
                {post.media_type === 'photo' && post.media_urls?.[0] && (
                    <img
                        src={post.media_urls[0]}
                        alt="Post"
                        className="w-full max-h-[600px] object-contain"
                        draggable={false}
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

                {/* Double-tap heart animation */}
                {showHeart && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                        <Heart className="h-20 w-20 text-white fill-white opacity-90" />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLike}
                            className="focus:outline-none active:scale-90 transition-transform"
                        >
                            <Heart
                                className={cn(
                                    'h-6 w-6 transition-all',
                                    liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-900 hover:text-gray-600'
                                )}
                            />
                        </button>
                        <Link href={`/post/${post.id}`}>
                            <button className="focus:outline-none active:scale-90 transition-transform">
                                <MessageCircle className="h-6 w-6 text-gray-900 hover:text-gray-600" />
                            </button>
                        </Link>
                        <button
                            onClick={handleShare}
                            className="focus:outline-none active:scale-90 transition-transform"
                        >
                            <Send className="h-6 w-6 text-gray-900 hover:text-gray-600" />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        className="focus:outline-none active:scale-90 transition-transform"
                    >
                        <Bookmark
                            className={cn(
                                'h-6 w-6 transition-all',
                                saved ? 'fill-gray-900 text-gray-900' : 'text-gray-900 hover:text-gray-600'
                            )}
                        />
                    </button>
                </div>
            </div>

            {/* Likes Count */}
            {likesCount > 0 && (
                <div className="px-3 pb-1.5">
                    <p className="font-semibold text-sm text-gray-900">
                        {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
                    </p>
                </div>
            )}

            {/* Caption */}
            {post.content && (
                <div className="px-3 pb-1">
                    <p className="text-sm text-gray-900">
                        <span className="font-semibold mr-1.5">Dr. {post.doctor.name}</span>
                        <span className="text-gray-900">{displayCaption}</span>
                        {captionTruncated && !showFullCaption && (
                            <button
                                onClick={() => setShowFullCaption(true)}
                                className="text-gray-500 ml-1"
                            >
                                more
                            </button>
                        )}
                    </p>
                </div>
            )}

            {/* Comments Preview */}
            {comments.length > 0 && (
                <div className="px-3 space-y-1 pb-1">
                    {comments.slice(0, 2).map((comment) => (
                        <div key={comment.id}>
                            <p className="text-sm text-gray-900">
                                <span className="font-semibold mr-1.5">{comment.username}</span>
                                {comment.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* View all comments */}
            {post.comments_count > 2 && (
                <Link href={`/post/${post.id}`}>
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                        View all {post.comments_count} comments
                    </button>
                </Link>
            )}

            {/* Timestamp */}
            <p className="px-3 pb-3 text-[10px] text-gray-400 uppercase tracking-wide">
                {formatTimeAgo(post.created_at)}
            </p>

            {/* Add Comment */}
            <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-3">
                <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-gray-100">U</AvatarFallback>
                </Avatar>
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 text-sm outline-none placeholder:text-gray-400"
                />
                {commentText.trim() && (
                    <button
                        onClick={handleAddComment}
                        className="text-medical-blue font-semibold text-sm hover:text-blue-700"
                    >
                        Post
                    </button>
                )}
            </div>

            {/* Quick Book Modal */}
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
                    source="feed"
                />
            )}
        </div>
    );
}
