'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Play } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils/time';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PostCardProps {
    post: {
        id: string;
        doctor: {
            id: string;
            name: string;
            specialty: string;
            image?: string;
        };
        content: string;
        media_urls: string[];
        media_type: 'photo' | 'video';
        thumbnail_url?: string;
        likes_count: number;
        comments_count: number;
        user_liked?: boolean;
        created_at: string;
    };
}

export function PostCard({ post }: PostCardProps) {
    const [liked, setLiked] = useState(post.user_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [showFullCaption, setShowFullCaption] = useState(false);

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
        : post.content.substring(0, 100) + '...';

    return (
        <div className="bg-white border-b border-gray-100 mb-2">
            {/* Doctor Header */}
            <Link href={`/search/${post.doctor.id}`}>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-medical-blue/20">
                            <AvatarImage src={post.doctor.image} alt={post.doctor.name} />
                            <AvatarFallback className="bg-medical-blue text-white">
                                {post.doctor.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm text-gray-900">Dr. {post.doctor.name}</p>
                            <p className="text-xs text-gray-500">{post.doctor.specialty}</p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
            </Link>

            {/* Media */}
            <div className="relative bg-black">
                {post.media_type === 'photo' && post.media_urls?.[0] && (
                    <img
                        src={post.media_urls[0]}
                        alt="Post"
                        className="w-full max-h-[600px] object-contain"
                    />
                )}
                {post.media_type === 'video' && post.media_urls?.[0] && (
                    <div className="relative group">
                        {post.thumbnail_url && (
                            <img
                                src={post.thumbnail_url}
                                alt="Video thumbnail"
                                className="w-full max-h-[600px] object-contain"
                            />
                        )}
                        <video
                            src={post.media_urls[0]}
                            controls
                            className="w-full max-h-[600px] object-contain"
                            poster={post.thumbnail_url}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 rounded-full p-4">
                                <Play className="h-12 w-12 text-white fill-white" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 pt-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className="focus:outline-none active:scale-90 transition-transform"
                    >
                        <Heart
                            className={cn(
                                'h-7 w-7 transition-all',
                                liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-700 hover:text-gray-900'
                            )}
                        />
                    </button>
                    <Link href={`/post/${post.id}`}>
                        <button className="focus:outline-none active:scale-90 transition-transform">
                            <MessageCircle className="h-7 w-7 text-gray-700 hover:text-gray-900" />
                        </button>
                    </Link>
                    <button
                        onClick={handleShare}
                        className="focus:outline-none active:scale-90 transition-transform"
                    >
                        <Share2 className="h-7 w-7 text-gray-700 hover:text-gray-900" />
                    </button>
                </div>
            </div>

            {/* Likes */}
            {likesCount > 0 && (
                <div className="px-4 pt-2">
                    <p className="font-semibold text-sm">
                        {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
                    </p>
                </div>
            )}

            {/* Caption */}
            {post.content && (
                <div className="px-4 pt-2 pb-1">
                    <p className="text-sm">
                        <span className="font-semibold mr-2">Dr. {post.doctor.name}</span>
                        <span className="text-gray-700">{displayCaption}</span>
                        {captionTruncated && !showFullCaption && (
                            <button
                                onClick={() => setShowFullCaption(true)}
                                className="text-gray-500 ml-1 font-medium"
                            >
                                more
                            </button>
                        )}
                    </p>
                </div>
            )}

            {/* Comments */}
            {post.comments_count > 0 && (
                <Link href={`/post/${post.id}`}>
                    <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                        View all {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
                    </button>
                </Link>
            )}

            {/* Timestamp */}
            <p className="px-4 pb-3 text-[10px] text-gray-400 uppercase tracking-wide">
                {formatTimeAgo(post.created_at)} ago
            </p>
        </div>
    );
}
