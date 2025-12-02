'use client';

import { useState, useRef } from 'react';
import { useUserRoles } from '@/lib/hooks/use-user-roles';
import { redirect, useRouter } from 'next/navigation';
import { Camera, Video, Image as ImageIcon, X, Loader2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { showToast } from '@/lib/utils/toast';

export default function CreatePostPage() {
  const { isDoctor, loading } = useUserRoles();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-blue" />
      </div>
    );
  }

  if (!isDoctor) {
    redirect('/dashboard/dashboard');
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const type = file.type.startsWith('image/') ? 'photo' : file.type.startsWith('video/') ? 'video' : null;
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

  const handleCreatePost = async () => {
    if (!mediaFile) {
      showToast.error('Please select a photo or video', 'no-media');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 1. Upload media
      const formData = new FormData();
      formData.append('file', mediaFile);

      setUploadProgress(30);
      const uploadResponse = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadProgress(60);

      // 2. Create post
      const postData = {
        content: caption.trim(),
        media_urls: [uploadResponse.url],
        media_type: mediaType,
        thumbnail_url: uploadResponse.thumbnail_url,
      };

      await api.post('/social/posts', postData);

      setUploadProgress(100);
      showToast.success('Post created successfully!', 'post-created');

      // Navigate to feed
      setTimeout(() => {
        router.push('/feed');
      }, 500);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      showToast.error(error.response?.data?.error || 'Failed to create post', 'post-error');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg">Create Post</h1>
          <Button
            onClick={handleCreatePost}
            disabled={!mediaFile || uploading}
            className="bg-medical-blue hover:bg-blue-700 text-white rounded-xl h-9 px-4"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadProgress}%
              </>
            ) : (
              'Share'
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Media Selection */}
        {!mediaFile ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-medical-blue" />
                </div>
                <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center">
                  <Video className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Share a photo or video
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Share health tips, office updates, or patient success stories
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-medical-blue hover:bg-blue-700 text-white rounded-xl h-12"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Select from device
                </Button>

                <p className="text-xs text-gray-400">
                  Images: Max 10MB • Videos: Max 50MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Media Preview */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="relative">
                {mediaType === 'photo' ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full max-h-[500px] object-contain bg-black"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-[500px] object-contain bg-black"
                  />
                )}

                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Caption */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Caption
              </label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption... (health tips, updates, advice)"
                className="min-h-[120px] text-sm resize-none border-gray-200 focus:border-medical-blue rounded-xl"
                maxLength={2200}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  {caption.length}/2200 characters
                </p>
                {caption.length > 0 && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                💡 Tips for engaging posts
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Share valuable health tips and advice</li>
                <li>• Use clear, high-quality images or videos</li>
                <li>• Keep captions informative but concise</li>
                <li>• Include a call-to-action (e.g., "Book a consultation")</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed bottom-24 left-0 right-0 px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-medical-blue" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Creating your post...
                </p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-medical-blue transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm font-semibold text-medical-blue">
                {uploadProgress}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
