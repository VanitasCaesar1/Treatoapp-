'use client';

import { useState, useRef } from 'react';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { redirect, useRouter } from 'next/navigation';
import { X, Loader2, Check, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { showToast } from '@/lib/utils/toast';

export default function CreateStoryPage() {
    const { isDoctor, loading } = useUserRoles();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string>('');
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [uploading, setUploading] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (!isDoctor) {
        redirect('/dashboard');
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
        if (!type) {
            showToast.error('Please select an image or video file', 'invalid-file');
            return;
        }

        // Validate file size
        const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showToast.error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`, 'file-too-large');
            return;
        }

        setMediaFile(file);
        setMediaType(type);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setMediaPreview('');
        setMediaType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreateStory = async () => {
        if (!mediaFile) {
            showToast.error('Please select a photo or video', 'no-media');
            return;
        }

        try {
            setUploading(true);

            // 1. Upload media
            const formData = new FormData();
            formData.append('file', mediaFile);

            const uploadResponse = await api.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 2. Create story
            const storyData = {
                media_url: uploadResponse.url,
                media_type: mediaType,
            };

            await api.post('/social/stories', storyData);

            showToast.success('Story created successfully!', 'story-created');

            // Navigate to feed
            setTimeout(() => {
                router.push('/feed');
            }, 500);
        } catch (error: any) {
            console.error('Failed to create story:', error);
            showToast.error(error.response?.data?.error || 'Failed to create story', 'story-error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                    <h1 className="font-bold text-lg text-white">Create Story</h1>
                    <Button
                        onClick={handleCreateStory}
                        disabled={!mediaFile || uploading}
                        className="bg-medical-blue hover:bg-blue-700 text-white rounded-xl h-9 px-4"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sharing...
                            </>
                        ) : (
                            'Share'
                        )}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
                {!mediaFile ? (
                    /* Upload State */
                    <div className="text-center">
                        <div className="flex justify-center gap-4 mb-8">
                            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
                                <ImageIcon className="h-10 w-10 text-white" />
                            </div>
                            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
                                <Video className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        <h3 className="font-bold text-xl text-white mb-2">
                            Share a Health Tip
                        </h3>
                        <p className="text-sm text-white/60 mb-8 max-w-sm">
                            Share quick health tips, office updates, or behind-the-scenes content.
                            Stories disappear after 24 hours.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-black hover:bg-gray-100 rounded-xl h-12 px-6 font-semibold"
                        >
                            Select Media
                        </Button>

                        <p className="text-xs text-white/40 mt-4">
                            Images: Max 10MB • Videos: Max 50MB (up to 60 seconds)
                        </p>
                    </div>
                ) : (
                    /* Preview State */
                    <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden">
                        {/* Media Preview */}
                        {mediaType === 'image' ? (
                            <img
                                src={mediaPreview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <video
                                src={mediaPreview}
                                controls
                                className="w-full h-full object-contain"
                            />
                        )}

                        {/* Remove Button */}
                        <button
                            onClick={handleRemoveMedia}
                            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-white" />
                        </button>

                        {/* Tips Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <div className="flex items-start gap-3 text-white/80 text-sm">
                                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-white mb-1">Story Tips</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Keep it short and engaging</li>
                                        <li>• Share valuable health advice</li>
                                        <li>• Use clear, vertical format</li>
                                        <li>• Expires in 24 hours</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
