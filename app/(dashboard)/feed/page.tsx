'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { api } from '@/lib/api';
import { EnhancedPostCard } from '@/components/social/enhanced-post-card';
import { StoriesBar } from '@/components/social/stories-bar';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
    const router = useRouter();
    const { isDoctor } = useUserRoles();
    const { ref, inView } = useInView({
        threshold: 0.5,
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useInfiniteQuery({
        queryKey: ['social-feed'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get('/social/feed', {
                page: pageParam,
                limit: 10,
            });
            return response;
        },
        getNextPageParam: (lastPage, pages) => {
            // Check if there are more results
            if (!lastPage.data || lastPage.data.length < 10) return undefined;
            return pages.length + 1;
        },
        initialPageParam: 1,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-medical-blue mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading feed...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">Unable to load feed</h3>
                    <p className="text-sm text-gray-500 mb-4">Please check your connection and try again</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-medical-blue text-white rounded-xl text-sm font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const totalPosts = data?.pages.reduce((acc, page) => acc + (page.data?.length || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="font-bold text-xl">Feed</h1>
                    <Link href="/dashboard/dashboard">
                        <button className="text-sm text-medical-blue font-medium">
                            Dashboard
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stories Bar */}
            <div className="max-w-2xl mx-auto">
                <StoriesBar
                    showCreateButton={isDoctor}
                    onCreateStory={() => router.push('/doctor/create-story')}
                />
            </div>

            {/* Feed Content */}
            <div className="max-w-2xl mx-auto">
                {totalPosts === 0 ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center max-w-sm px-4">
                            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-bold text-gray-900 text-lg mb-2">No posts yet</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Follow doctors to see their posts in your feed
                            </p>
                            <Link href="/search">
                                <button className="px-6 py-3 bg-medical-blue text-white rounded-xl font-medium">
                                    Discover Doctors
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {data?.pages.map((page, i) => (
                            <div key={i}>
                                {page.data?.map((post: any) => (
                                    <EnhancedPostCard key={post.id} post={post} />
                                ))}
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        <div ref={ref} className="py-8">
                            {isFetchingNextPage && (
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            )}
                            {!hasNextPage && totalPosts > 0 && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">You're all caught up!</p>
                                    <p className="text-xs text-gray-400 mt-1">Check back later for new posts</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
