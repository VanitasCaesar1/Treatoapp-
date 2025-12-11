'use client';

import { useQuery } from '@tanstack/react-query';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { redirect, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Eye, Heart, MessageCircle, Users, BarChart3, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AnalyticsPage() {
    const { isDoctor, loading } = useUserRoles();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin h-8 w-8 border-4 border-medical-blue border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isDoctor) {
        redirect('/dashboard');
    }

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const response = await api.get('/social/analytics');
            return response.data;
        },
    });

    const stats = [
        {
            label: 'Total Followers',
            value: analytics?.followers_count || 0,
            change: analytics?.followers_growth || '+0',
            icon: Users,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Total Posts',
            value: analytics?.posts_count || 0,
            change: 'This month',
            icon: BarChart3,
            color: 'bg-purple-50 text-purple-600',
        },
        {
            label: 'Total Likes',
            value: analytics?.total_likes || 0,
            change: analytics?.likes_growth || '+0',
            icon: Heart,
            color: 'bg-red-50 text-red-600',
        },
        {
            label: 'Engagement Rate',
            value: `${analytics?.engagement_rate || 0}%`,
            change: 'Avg per post',
            icon: TrendingUp,
            color: 'bg-green-50 text-green-600',
        },
    ];

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
                        <h1 className="font-bold text-lg">Insights</h1>
                        <p className="text-xs text-gray-500">Your content performance</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-medical-blue" />
                </div>
            </div>

            {isLoading ? (
                <div className="p-4 space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="p-4 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                            </div>
                        ))}
                    </div>

                    {/* Top Posts */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900">Top Posts (Last 30 Days)</h2>
                            <Link href="/doctor/dashboard" className="text-xs text-medical-blue font-semibold">
                                View All
                            </Link>
                        </div>
                        {analytics?.top_posts?.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.top_posts.slice(0, 5).map((post: any, idx: number) => (
                                    <Link
                                        key={post.id}
                                        href={`/post/${post.id}`}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="relative h-12 w-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                            <img
                                                src={post.media_urls?.[0]}
                                                alt="Post"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 line-clamp-1">{post.content}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Heart className="h-3 w-3" />
                                                    {post.likes_count}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MessageCircle className="h-3 w-3" />
                                                    {post.comments_count}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Eye className="h-3 w-3" />
                                                    {post.views_count || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-lg font-bold text-medical-blue">#{idx + 1}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No posts yet</p>
                            </div>
                        )}
                    </div>

                    {/* Story Insights */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <h2 className="font-bold text-gray-900 mb-4">Story Performance</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics?.stories_count || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Stories</p>
                                <p className="text-[10px] text-gray-400">Last 7 days</p>
                            </div>
                            <div className="text-center border-x border-gray-100">
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics?.story_views || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Total Views</p>
                                <p className="text-[10px] text-gray-400">Avg {analytics?.avg_story_views || 0}/story</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {analytics?.story_reach || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Unique Reach</p>
                                <p className="text-[10px] text-gray-400">Individual viewers</p>
                            </div>
                        </div>
                    </div>

                    {/* Follower Growth */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <h2 className="font-bold text-gray-900 mb-4">Follower Growth</h2>
                        <div className="space-y-3">
                            {analytics?.follower_growth_chart?.map((day: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{day.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-medical-blue rounded-full"
                                                style={{ width: `${Math.min((day.followers / analytics.followers_count) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                                            +{day.new_followers}
                                        </span>
                                    </div>
                                </div>
                            )) || (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No data available</p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Best Posting Times */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <h2 className="font-bold text-gray-900 mb-3">Best Time to Post</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Peak Engagement</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {analytics?.best_posting_time || '6-8 PM'}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Best Day</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {analytics?.best_posting_day || 'Sunday'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
