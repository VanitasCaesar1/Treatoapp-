'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { StoryViewer } from './story-viewer';

interface Story {
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    created_at: string;
    expires_at: string;
    viewed: boolean;
}

interface DoctorWithStories {
    id: string;
    name: string;
    image?: string;
    specialty: string;
    stories: Story[];
    has_unviewed: boolean;
}

interface StoriesBarProps {
    onCreateStory?: () => void;
    showCreateButton?: boolean;
}

export function StoriesBar({ onCreateStory, showCreateButton = false }: StoriesBarProps) {
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithStories | null>(null);
    const [showViewer, setShowViewer] = useState(false);

    const { data: doctorsWithStories, isLoading } = useQuery({
        queryKey: ['stories'],
        queryFn: async () => {
            const response = await api.get('/social/stories');
            return response.data || [];
        },
        refetchInterval: 60000, // Refresh every minute
    });

    const handleStoryClick = (doctor: DoctorWithStories) => {
        setSelectedDoctor(doctor);
        setShowViewer(true);
    };

    const handleCloseViewer = () => {
        setShowViewer(false);
        setSelectedDoctor(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!doctorsWithStories || doctorsWithStories.length === 0) {
        return null;
    }

    return (
        <>
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {/* Create Story Button (for doctors) */}
                    {showCreateButton && onCreateStory && (
                        <button
                            onClick={onCreateStory}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0"
                        >
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                    <Plus className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-gray-700 max-w-[70px] truncate">
                                Create
                            </p>
                        </button>
                    )}

                    {/* Doctor Stories */}
                    {doctorsWithStories.map((doctor: DoctorWithStories) => (
                        <button
                            key={doctor.id}
                            onClick={() => handleStoryClick(doctor)}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0"
                        >
                            {/* Avatar with gradient ring */}
                            <div className="relative">
                                <div
                                    className={cn(
                                        'h-16 w-16 rounded-full p-[2px]',
                                        doctor.has_unviewed
                                            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                                            : 'bg-gray-300'
                                    )}
                                >
                                    <div className="h-full w-full rounded-full bg-white p-[2px]">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={doctor.image} alt={doctor.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-medical-blue font-semibold">
                                                {doctor.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-gray-700 max-w-[70px] truncate">
                                Dr. {doctor.name.split(' ')[0]}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Story Viewer */}
            {selectedDoctor && (
                <StoryViewer
                    doctor={selectedDoctor}
                    open={showViewer}
                    onClose={handleCloseViewer}
                />
            )}
        </>
    );
}
