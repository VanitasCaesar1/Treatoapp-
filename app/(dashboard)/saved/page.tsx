'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Grid3x3, Bookmark, Play, Heart, MessageCircle, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface SavedPost {
    id: string;
    doctor: {
        id: string;
        name: string;
        specialty: string;
    };
    media_urls: string[];
    media_type: 'photo' | 'video';
    thumbnail_url?: string;
    likes_count: number;
    comments_count: number;
    content: string;
    saved_at: string;
}

export default function SavedPostsPage() {
    const router = useRouter();
    const [filterSpecialty, setFilterSpecialty] = useState<string>('all');

    const { data: savedPosts, isLoading } = useQuery({
        queryKey: ['saved-posts', filterSpecialty],
        queryFn: async () => {
            const response = await api.get('/social/saved', {
                params: {
                    specialty: filterSpecialty !== 'all' ? filterSpecialty : undefined,
                }
            });
            return response.data || [];
        },
    });

    const specialties = ['all', 'cardiology', 'pediatrics', 'dermatology', 'orthopedics', 'general'];

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
                    <div className="flex-1">
                        <h1 className="font-bold text-lg">Saved Posts</h1>
                        <p className="text-xs text-gray-500">
                            {savedPosts?.length || 0} saved health tips
                        </p>
                    </div>
                    <Bookmark className="h-5 w-5 text-medical-blue" />
                </div>

                {/* Filter Bar */}
                <div className="px-4 pb-3 overflow-x-auto">
                    <div className="flex gap-2">
                        {specialties.map((specialty) => (
                            <button
                                key={specialty}
                                onClick={() => setFilterSpecialty(specialty)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filterSpecialty === specialty
                                        ? 'bg-medical-blue text-white'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-3 gap-1 p-1">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
                    ))}
                </div>
            ) : savedPosts?.length === 0 ? (
                <div className="text-center py-20 px-4">
                    <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2">No saved posts</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Save helpful health tips to view them later
                    </p>
                    <Link href="/feed">
                        <button className="bg-medical-blue text-white px-6 py-3 rounded-xl font-semibold">
                            Explore Posts
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-1 p-1">
                    {savedPosts?.map((post: SavedPost) => (
                        <Link
                            key={post.id}
                            href={`/post/${post.id}`}
                            className="group aspect-square relative bg-gray-100 overflow-hidden"
                        >
                            {/* Post Image/Video */}
                            <img
                                src={post.media_type === 'video' && post.thumbnail_url
                                    ? post.thumbnail_url
                                    : post.media_urls[0]
                                }
                                alt="Saved post"
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

                            {/* Saved Badge */}
                            <div className="absolute top-2 left-2">
                                <div className="bg-medical-blue rounded-full p-1">
                                    <Bookmark className="h-3 w-3 text-white fill-white" />
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3">
                                {/* Doctor Info */}
                                <div>
                                    <p className="text-white text-xs font-semibold">
                                        Dr. {post.doctor.name}
                                    </p>
                                    <p className="text-white/80 text-[10px]">
                                        {post.doctor.specialty}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-4 text-white text-sm">
                                    <div className="flex items-center gap-1">
                                        <Heart className="h-4 w-4 fill-white" />
                                        <span className="font-semibold">{post.likes_count}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="h-4 w-4 fill-white" />
                                        <span className="font-semibold">{post.comments_count}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
