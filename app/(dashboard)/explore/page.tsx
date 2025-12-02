'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Search, Grid3x3, Play, Heart, MessageCircle, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QuickBookModal } from '@/components/booking/quick-book-modal';

interface Post {
    id: string;
    doctor: {
        id: string;
        name: string;
        specialty: string;
        image?: string;
        consultation_fee?: number;
        rating?: number;
    };
    media_urls: string[];
    media_type: 'photo' | 'video';
    thumbnail_url?: string;
    likes_count: number;
    comments_count: number;
    content: string;
}

const categories = [
    { id: 'all', name: 'All', icon: Grid3x3 },
    { id: 'cardiology', name: 'Cardiology', icon: Heart },
    { id: 'pediatrics', name: 'Pediatrics', icon: TrendingUp },
    { id: 'dermatology', name: 'Dermatology', icon: TrendingUp },
    { id: 'orthopedics', name: 'Orthopedics', icon: TrendingUp },
    { id: 'neurology', name: 'Neurology', icon: TrendingUp },
    { id: 'general', name: 'General', icon: TrendingUp },
];

export default function ExplorePage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const { ref: loadMoreRef, inView } = useInView();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['explore-posts', activeCategory, searchQuery],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get('/social/explore', {
                params: {
                    page: pageParam,
                    limit: 18,
                    category: activeCategory !== 'all' ? activeCategory : undefined,
                    search: searchQuery || undefined,
                }
            });
            return response.data;
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data && lastPage.data.length === 18) {
                return pages.length + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    // Auto-load more when scrolling
    if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
    }

    const handlePostClick = (post: Post) => {
        // Navigate to full post view
        window.location.href = `/post/${post.id}`;
    };

    const handleBookClick = (e: React.MouseEvent, doctor: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header with Search */}
            <div className="sticky top-0 z-20 bg-white border-b">
                <div className="px-4 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search health topics, doctors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:bg-gray-50 focus:ring-2 focus:ring-medical-blue/20 transition-all"
                        />
                    </div>
                </div>

                {/* Category Filters */}
                <div className="px-4 pb-3 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={cn(
                                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                                    activeCategory === category.id
                                        ? 'bg-medical-blue text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                )}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="p-1">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-1">
                        {[...Array(18)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-1">
                            {data?.pages.map((page) =>
                                page.data?.map((post: Post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => handlePostClick(post)}
                                        className="group aspect-square relative bg-gray-100 overflow-hidden cursor-pointer"
                                    >
                                        {/* Post Image/Video */}
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

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3">
                                            {/* Doctor Info */}
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                                                    {post.doctor.image && (
                                                        <img
                                                            src={post.doctor.image}
                                                            alt={post.doctor.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-xs font-semibold truncate">
                                                        Dr. {post.doctor.name}
                                                    </p>
                                                    <p className="text-white/80 text-[10px] truncate">
                                                        {post.doctor.specialty}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bottom: Stats + Book Button */}
                                            <div className="space-y-2">
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

                                                {/* Book Button */}
                                                {post.doctor.consultation_fee && (
                                                    <button
                                                        onClick={(e) => handleBookClick(e, post.doctor)}
                                                        className="w-full bg-white text-medical-blue font-semibold text-xs py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                    >
                                                        Book - ₹{post.doctor.consultation_fee}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Load More Trigger */}
                        <div ref={loadMoreRef} className="py-4">
                            {isFetchingNextPage && (
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-medical-blue" />
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {data?.pages[0]?.data?.length === 0 && (
                            <div className="text-center py-20">
                                <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                                <p className="font-semibold text-gray-900 mb-1">No posts found</p>
                                <p className="text-sm text-gray-500">
                                    Try changing your search or category filter
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick Book Modal */}
            {selectedDoctor && (
                <QuickBookModal
                    doctor={{
                        id: selectedDoctor.id,
                        name: selectedDoctor.name,
                        specialty: selectedDoctor.specialty,
                        image: selectedDoctor.image,
                        consultation_fee: selectedDoctor.consultation_fee || 500,
                        rating: selectedDoctor.rating,
                        review_count: selectedDoctor.review_count,
                    }}
                    open={showBookingModal}
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedDoctor(null);
                    }}
                    source="explore"
                />
            )}
        </div>
    );
}
