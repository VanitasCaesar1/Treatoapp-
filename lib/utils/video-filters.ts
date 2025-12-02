// Video filter and editing utilities for Instagram-style effects

export type VideoFilter =
    | 'none'
    | 'grayscale'
    | 'sepia'
    | 'vintage'
    | 'warm'
    | 'cool'
    | 'bright'
    | 'contrast';

export const VIDEO_FILTERS: Record<VideoFilter, string> = {
    none: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    vintage: 'sepia(50%) contrast(120%) brightness(90%)',
    warm: 'sepia(20%) saturate(120%) brightness(105%)',
    cool: 'hue-rotate(180deg) saturate(80%)',
    bright: 'brightness(120%) contrast(110%)',
    contrast: 'contrast(140%) saturate(130%)',
};

export function applyVideoFilter(videoElement: HTMLVideoElement, filter: VideoFilter) {
    if (videoElement) {
        videoElement.style.filter = VIDEO_FILTERS[filter];
    }
}

export async function captureVideoThumbnail(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;

        video.onloadedmetadata = () => {
            video.currentTime = 1; // Capture at 1 second
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(URL.createObjectURL(blob));
                    } else {
                        reject(new Error('Failed to create thumbnail'));
                    }
                }, 'image/jpeg', 0.8);
            }
        };

        video.onerror = reject;
        video.src = URL.createObjectURL(videoFile);
    });
}

export interface VideoEditOptions {
    filter?: VideoFilter;
    trim?: {
        start: number; // seconds
        end: number;   // seconds
    };
    volume?: number; // 0-1
    speed?: number;  // 0.5-2
}

export async function processVideo(
    file: File,
    options: VideoEditOptions
): Promise<{ file: File; thumbnail: string }> {
    // For client-side preview, we'll apply CSS filters
    // For actual processing, this would need FFmpeg.wasm or server-side processing  const thumbnail = await captureVideoThumbnail(file);

    // Return original file with metadata for server-side processing
    return {
        file,
        thumbnail,
    };
}

export function getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
}> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
            });
            URL.revokeObjectURL(video.src);
        };

        video.onerror = reject;
        video.src = URL.createObjectURL(file);
    });
}
