'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid3x3, Play, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  media_urls: string[];
  media_type: 'photo' | 'video';
  thumbnail_url?: string;
  likes_count: number;
  comments_count: number;
  content: string;
  created_at: string;
}

interface DoctorPostsGridProps {
  doctorId: string;
  limit?: number;
}

export function DoctorPostsGrid({ doctorId, limit }: DoctorPostsGridProps) {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['doctor-posts', doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${doctorId}/posts`, {
        limit: limit || 50,
      });
      return response.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Grid3x3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Failed to load posts</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-gray-900 mb-1">No posts yet</p>
        <p className="text-sm text-gray-500">This doctor hasn't shared any content</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post: Post) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="group aspect-square relative bg-gray-100 overflow-hidden"
        >
          {/* Post Image/Video Thumbnail */}
          <img
            src={post.media_type === 'video' && post.thumbnail_url 
              ? post.thumbnail_url 
              : post.media_urls[0]
            }
            alt="Post"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Video Indicator */}
          {post.media_type === 'video' && (
            <div className="absolute top-2 right-2">
              <div className="bg-black/60 rounded-full p-1">
                <Play className="h-4 w-4 text-white fill-white" />
              </div>
            </div>
          )}

          {/* Hover Overlay with Stats */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-6 text-white">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 fill-white" />
                <span className="font-semibold">{post.likes_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 fill-white" />
                <span className="font-semibold">{post.comments_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
