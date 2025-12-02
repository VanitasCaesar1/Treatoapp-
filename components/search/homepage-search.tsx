'use client';

import { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function HomepageSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    const { data: results } = useQuery({
        queryKey: ['search', query],
        queryFn: async () => {
            if (!query || query.length < 2) return { doctors: [], posts: [] };
            const response = await api.get('/search', {
                params: { q: query, limit: 5 }
            });
            return response.data;
        },
        enabled: query.length >= 2,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setShowResults(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search doctors, specialties, health topics..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-medical-blue/20 transition-all"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setShowResults(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                )}
            </form>

            {/* Quick Results Dropdown */}
            {showResults && query.length >= 2 && results && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-96 overflow-y-auto z-50">
                    {/* Doctors */}
                    {results.doctors?.length > 0 && (
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Doctors</p>
                            {results.doctors.map((doctor: any) => (
                                <Link
                                    key={doctor.id}
                                    href={`/search/${doctor.id}`}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={doctor.image} />
                                        <AvatarFallback className="bg-medical-blue text-white text-xs">
                                            {doctor.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">Dr. {doctor.name}</p>
                                        <p className="text-xs text-gray-500">{doctor.specialty}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Posts */}
                    {results.posts?.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Posts</p>
                            {results.posts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/post/${post.id}`}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {post.media_urls?.[0] && (
                                            <img src={post.media_urls[0]} alt="Post" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm line-clamp-2">{post.content}</p>
                                        <p className="text-xs text-gray-500">by Dr. {post.doctor.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {results.doctors?.length === 0 && results.posts?.length === 0 && (
                        <div className="p-6 text-center">
                            <p className="text-sm text-gray-500">No results found</p>
                            <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                        </div>
                    )}

                    {/* See All Results */}
                    <Link
                        href={`/search?q=${encodeURIComponent(query)}`}
                        className="block p-3 text-center text-sm font-semibold text-medical-blue hover:bg-blue-50 border-t border-gray-100"
                    >
                        See all results for "{query}"
                    </Link>
                </div>
            )}
        </div>
    );
}
