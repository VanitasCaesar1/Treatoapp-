'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserMinus, Search } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    image?: string;
    specialty?: string;
    is_following?: boolean;
    is_followed_by?: boolean;
}

export default function FollowingPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: following, refetch: refetchFollowing } = useQuery({
        queryKey: ['following'],
        queryFn: async () => {
            const response = await api.get('/social/following');
            return response.data || [];
        },
    });

    const { data: followers } = useQuery({
        queryKey: ['followers'],
        queryFn: async () => {
            const response = await api.get('/social/followers');
            return response.data || [];
        },
    });

    const handleUnfollow = async (userId: string) => {
        try {
            await api.delete(`/doctors/${userId}/follow`);
            refetchFollowing();
        } catch (error) {
            console.error('Failed to unfollow:', error);
        }
    };

    const filteredFollowing = following?.filter((user: User) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFollowers = followers?.filter((user: User) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <h1 className="font-bold text-lg">Connections</h1>
                        <p className="text-xs text-gray-500">Manage your network</p>
                    </div>
                    <Users className="h-5 w-5 text-medical-blue" />
                </div>

                {/* Search Bar */}
                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="following" className="bg-white">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger
                        value="following"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:bg-transparent px-6 py-3"
                    >
                        Following ({following?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger
                        value="followers"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:bg-transparent px-6 py-3"
                    >
                        Followers ({followers?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Following Tab */}
                <TabsContent value="following" className="p-0">
                    {filteredFollowing?.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-bold text-gray-900 text-lg mb-2">
                                {searchQuery ? 'No results found' : 'Not following anyone'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {searchQuery ? 'Try a different search' : 'Discover and follow doctors'}
                            </p>
                            {!searchQuery && (
                                <Link href="/explore">
                                    <Button className="bg-medical-blue hover:bg-blue-700">
                                        Explore Doctors
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredFollowing?.map((user: User) => (
                                <div key={user.id} className="px-4 py-3 flex items-center gap-3">
                                    <Link href={`/search/${user.id}`} className="flex items-center gap-3 flex-1">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-medical-blue text-white">
                                                {user.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900">Dr. {user.name}</p>
                                            {user.specialty && (
                                                <p className="text-sm text-gray-500">{user.specialty}</p>
                                            )}
                                        </div>
                                    </Link>
                                    <Button
                                        onClick={() => handleUnfollow(user.id)}
                                        variant="outline"
                                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                                    >
                                        <UserMinus className="h-4 w-4 mr-2" />
                                        Unfollow
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Followers Tab */}
                <TabsContent value="followers" className="p-0">
                    {filteredFollowers?.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-bold text-gray-900 text-lg mb-2">
                                {searchQuery ? 'No results found' : 'No followers yet'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {searchQuery ? 'Try a different search' : 'Share great content to gain followers'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredFollowers?.map((user: User) => (
                                <div key={user.id} className="px-4 py-3 flex items-center gap-3">
                                    <Link href={`/search/${user.id}`} className="flex items-center gap-3 flex-1">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="bg-gray-100 text-gray-600">
                                                {user.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            {user.is_following && (
                                                <p className="text-xs text-medical-blue">Following</p>
                                            )}
                                        </div>
                                    </Link>
                                    {!user.is_following && user.specialty && (
                                        <Link href={`/search/${user.id}`}>
                                            <Button className="bg-medical-blue hover:bg-blue-700">
                                                Follow Back
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
