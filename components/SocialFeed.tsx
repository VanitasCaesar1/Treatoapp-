'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Heart } from 'lucide-react';

const stories = [
    { id: 1, user: 'Dr. Smith', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80', type: 'video' },
    { id: 2, user: 'HealthyLiving', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80', type: 'image' },
    { id: 3, user: 'CardioTips', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', type: 'video' },
    { id: 4, user: 'YogaDaily', image: 'https://images.unsplash.com/photo-1544367563-12123d897571?w=800&q=80', type: 'image' },
    { id: 5, user: 'MedNews', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80', type: 'image' },
];

export default function SocialFeed() {
    return (
        <div className="py-6 border-t border-gray-100">
            <div className="px-6 mb-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Featured Stories</h2>
                <span className="text-sm text-airbnb-red font-medium">View All</span>
            </div>

            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 px-6 pb-4">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="relative w-32 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
                        >
                            <img
                                src={story.image}
                                alt={story.user}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

                            {story.type === 'video' && (
                                <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm p-1 rounded-full">
                                    <Play className="w-3 h-3 text-white fill-white" />
                                </div>
                            )}

                            <div className="absolute bottom-3 left-3 right-3">
                                <p className="text-white text-xs font-medium truncate">{story.user}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
