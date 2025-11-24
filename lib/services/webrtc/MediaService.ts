/**
 * MediaService - Simplified for Patient Mobile App
 * Manages media devices and streams for video calling
 */

export interface MediaConstraints {
    video?: boolean | MediaTrackConstraints;
    audio?: boolean | MediaTrackConstraints;
}

export class MediaService {
    private currentStream: MediaStream | null = null;

    /**
     * Get available media devices
     */
    async getDevices(): Promise<MediaDeviceInfo[]> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices;
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            throw error;
        }
    }

    /**
     * Get user media with mobile-optimized constraints
     */
    async getUserMedia(constraints?: MediaConstraints): Promise<MediaStream> {
        try {
            // Mobile-optimized default constraints
            const mobileConstraints: MediaConstraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 30 },
                    facingMode: 'user' // Front camera
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            const finalConstraints = constraints || mobileConstraints;
            this.currentStream = await navigator.mediaDevices.getUserMedia(finalConstraints);

            console.log('Got user media:', this.currentStream.getTracks().map(t => `${t.kind}: ${t.label}`));
            return this.currentStream;
        } catch (error: any) {
            console.error('Failed to get user media:', error);

            // Provide user-friendly error messages
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                throw new Error('Camera/microphone permission denied. Please grant access in settings.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                throw new Error('No camera or microphone found on this device.');
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                throw new Error('Camera or microphone is already in use by another application.');
            } else {
                throw new Error(`Failed to access camera/microphone: ${error.message}`);
            }
        }
    }

    /**
     * Switch camera (front/back) on mobile
     */
    async switchCamera(): Promise<MediaStream> {
        try {
            if (!this.currentStream) {
                throw new Error('No active stream to switch camera');
            }

            // Get current facing mode
            const videoTrack = this.currentStream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            const currentFacingMode = settings.facingMode;

            // Switch to opposite camera
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

            // Stop current stream
            this.stopAllTracks();

            // Get new stream with switched camera
            const newStream = await this.getUserMedia({
                video: {
                    facingMode: newFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            });

            this.currentStream = newStream;
            return newStream;
        } catch (error) {
            console.error('Failed to switch camera:', error);
            throw error;
        }
    }

    /**
     * Mute/unmute audio
     */
    toggleAudio(stream: MediaStream): boolean {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) return false;

        const enabled = !audioTracks[0].enabled;
        audioTracks.forEach(track => {
            track.enabled = enabled;
        });

        console.log('Audio toggled:', enabled);
        return enabled;
    }

    /**
     * Enable/disable video
     */
    toggleVideo(stream: MediaStream): boolean {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) return false;

        const enabled = !videoTracks[0].enabled;
        videoTracks.forEach(track => {
            track.enabled = enabled;
        });

        console.log('Video toggled:', enabled);
        return enabled;
    }

    /**
     * Check if specific permissions are granted
     */
    async checkPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
        try {
            const permissions = {
                camera: false,
                microphone: false
            };

            // Check camera permission
            try {
                const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
                permissions.camera = cameraPermission.state === 'granted';
            } catch (e) {
                console.log('Camera permission check not supported');
            }

            // Check microphone permission
            try {
                const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                permissions.microphone = micPermission.state === 'granted';
            } catch (e) {
                console.log('Microphone permission check not supported');
            }

            return permissions;
        } catch (error) {
            console.error('Failed to check permissions:', error);
            return { camera: false, microphone: false };
        }
    }

    /**
     * Request permissions (by attempting to access media)
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            // Stop immediately, we just wanted to trigger permission request
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    }

    /**
     * Stop all tracks in current stream
     */
    stopAllTracks(): void {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
            this.currentStream = null;
        }
    }

    /**
     * Cleanup all resources
     */
    cleanup(): void {
        this.stopAllTracks();
        console.log('MediaService cleaned up');
    }
}
