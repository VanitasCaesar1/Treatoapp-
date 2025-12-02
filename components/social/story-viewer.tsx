'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils/time';
import { cn } from '@/lib/utils';

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
}

interface StoryViewerProps {
    doctor: DoctorWithStories;
    open: boolean;
    onClose: () => void;
}

export function StoryViewer({ doctor, open, onClose }: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    const currentStory = doctor.stories[currentIndex];
    const duration = currentStory?.media_type === 'video' ? 15000 : 5000; // 15s for video, 5s for image

    useEffect(() => {
        if (!open) return;

        // Mark story as viewed
        if (currentStory && !currentStory.viewed) {
            api.post(`/social/stories/${currentStory.id}/view`).catch(console.error);
        }

        // Reset progress
        setProgress(0);

        // Start progress timer
        if (!isPaused) {
            const startTime = Date.now();
            progressInterval.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min((elapsed / duration) * 100, 100);
                setProgress(newProgress);

                if (newProgress >= 100) {
                    handleNext();
                }
            }, 50);
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [currentIndex, isPaused, open]);

    const handleNext = () => {
        if (currentIndex < doctor.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        }
    };

    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width / 3) {
            handlePrevious();
        } else if (x > (width * 2) / 3) {
            handleNext();
        } else {
            setIsPaused(!isPaused);
        }
    };

    if (!open || !currentStory) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
                {doctor.stories.map((story, idx) => (
                    <div
                        key={story.id}
                        className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                    >
                        <div
                            className="h-full bg-white transition-all duration-100"
                            style={{
                                width:
                                    idx < currentIndex
                                        ? '100%'
                                        : idx === currentIndex
                                            ? `${progress}%`
                                            : '0%',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent p-4 pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white/80">
                            <AvatarImage src={doctor.image} alt={doctor.name} />
                            <AvatarFallback className="bg-medical-blue text-white">
                                {doctor.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-white text-sm">
                                Dr. {doctor.name}
                            </p>
                            <p className="text-xs text-white/80">
                                {formatTimeAgo(currentStory.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStory.media_type === 'video' && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                {isMuted ? (
                                    <VolumeX className="h-5 w-5 text-white" />
                                ) : (
                                    <Volume2 className="h-5 w-5 text-white" />
                                )}
                            </button>
                        )}
                        {isPaused ? (
                            <button
                                onClick={() => setIsPaused(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <Play className="h-5 w-5 text-white fill-white" />
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsPaused(true)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <Pause className="h-5 w-5 text-white" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Story Content */}
            <div
                className="h-full w-full flex items-center justify-center"
                onClick={handleTap}
            >
                {currentStory.media_type === 'image' ? (
                    <img
                        src={currentStory.media_url}
                        alt="Story"
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <video
                        ref={videoRef}
                        src={currentStory.media_url}
                        className="max-h-full max-w-full object-contain"
                        autoPlay
                        muted={isMuted}
                        playsInline
                        onEnded={handleNext}
                    />
                )}
            </div>

            {/* Navigation Hints (invisible tap zones) */}
            <div className="absolute inset-0 flex pointer-events-none">
                <div className="w-1/3" />
                <div className="w-1/3" />
                <div className="w-1/3" />
            </div>
        </div>
    );
}
