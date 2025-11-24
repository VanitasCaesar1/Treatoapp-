/**
 * WebRTCService - Simplified for Patient Mobile App
 * Manages WebRTC peer connections for receiving video calls from doctors
 */

export type ConnectionQuality = {
    level: 'excellent' | 'good' | 'poor' | 'disconnected';
    latency: number;
    packetLoss: number;
};

export type WebRTCConfig = {
    iceServers: RTCIceServer[];
};

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private sessionId: string;
    private userId: string;
    private userType: 'patient';

    // Event callbacks
    private onRemoteStreamCallback?: (stream: MediaStream) => void;
    private onConnectionStateCallback?: (state: RTCPeerConnectionState) => void;
    private onIceCandidateCallback?: (candidate: RTCIceCandidate) => void;
    private onErrorCallback?: (error: Error) => void;

    constructor(sessionId: string, userId: string) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.userType = 'patient';
    }

    /**
     * Initialize WebRTC peer connection with TURN/STUN servers
     */
    async initializeConnection(turnCredentials?: RTCIceServer[]): Promise<void> {
        try {
            // Default STUN server (Google's public STUN)
            const defaultIceServers: RTCIceServer[] = [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ];

            const iceServers = turnCredentials || defaultIceServers;

            const config: RTCConfiguration = {
                iceServers,
                iceCandidatePoolSize: 10,
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require',
            };

            this.peerConnection = new RTCPeerConnection(config);

            // Set up event listeners
            this.setupPeerConnectionListeners();

            console.log('WebRTC connection initialized');
        } catch (error) {
            console.error('Failed to initialize WebRTC connection:', error);
            this.onErrorCallback?.(error as Error);
            throw error;
        }
    }

    /**
     * Set up peer connection event listeners
     */
    private setupPeerConnectionListeners(): void {
        if (!this.peerConnection) return;

        // ICE candidate event
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.onIceCandidateCallback?.(event.candidate);
            }
        };

        // Connection state change
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection?.connectionState;
            console.log('Connection state:', state);
            if (state) {
                this.onConnectionStateCallback?.(state);
            }
        };

        // Remote stream received
        this.peerConnection.ontrack = (event) => {
            console.log('Remote track received:', event.track.kind);

            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
                this.onRemoteStreamCallback?.(this.remoteStream);
            }

            this.remoteStream.addTrack(event.track);
        };

        // ICE connection state change
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
        };
    }

    /**
     * Get user media (camera and microphone)
     */
    async getUserMedia(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
        try {
            // Mobile-optimized constraints
            const mobileConstraints: MediaStreamConstraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 30 },
                    facingMode: 'user' // Front camera for patient
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(mobileConstraints);
            this.localStream = stream;

            // Add local tracks to peer connection
            if (this.peerConnection) {
                stream.getTracks().forEach(track => {
                    this.peerConnection?.addTrack(track, stream);
                });
            }

            console.log('Got user media:', stream.getTracks().map(t => t.kind));
            return stream;
        } catch (error) {
            console.error('Failed to get user media:', error);
            this.onErrorCallback?.(error as Error);
            throw error;
        }
    }

    /**
     * Create WebRTC answer (patient responds to doctor's offer)
     */
    async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        try {
            if (!this.peerConnection) {
                throw new Error('Peer connection not initialized');
            }

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            console.log('Created answer');
            return answer;
        } catch (error) {
            console.error('Failed to create answer:', error);
            this.onErrorCallback?.(error as Error);
            throw error;
        }
    }

    /**
     * Add ICE candidate received from signaling server
     */
    async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        try {
            if (!this.peerConnection) {
                throw new Error('Peer connection not initialized');
            }

            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Added ICE candidate');
        } catch (error) {
            console.error('Failed to add ICE candidate:', error);
            // Don't throw, ICE failures are recoverable
        }
    }

    /**
     * Toggle audio (mute/unmute)
     */
    async toggleAudio(): Promise<boolean> {
        if (!this.localStream) return false;

        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length === 0) return false;

        const enabled = !audioTracks[0].enabled;
        audioTracks.forEach(track => {
            track.enabled = enabled;
        });

        console.log('Audio toggled:', enabled);
        return enabled;
    }

    /**
     * Toggle video (enable/disable camera)
     */
    async toggleVideo(): Promise<boolean> {
        if (!this.localStream) return false;

        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length === 0) return false;

        const enabled = !videoTracks[0].enabled;
        videoTracks.forEach(track => {
            track.enabled = enabled;
        });

        console.log('Video toggled:', enabled);
        return enabled;
    }

    /**
     * Get connection quality metrics
     */
    async getConnectionQuality(): Promise<ConnectionQuality> {
        if (!this.peerConnection) {
            return {
                level: 'disconnected',
                latency: 0,
                packetLoss: 0
            };
        }

        try {
            const stats = await this.peerConnection.getStats();
            let latency = 0;
            let packetLoss = 0;

            stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    latency = report.currentRoundTripTime || 0;
                }
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    packetLoss = report.packetsLost || 0;
                }
            });

            // Determine quality level
            let level: ConnectionQuality['level'] = 'excellent';
            if (latency > 300 || packetLoss > 50) {
                level = 'poor';
            } else if (latency > 150 || packetLoss > 20) {
                level = 'good';
            }

            return {
                level,
                latency: Math.round(latency * 1000), // Convert to ms
                packetLoss
            };
        } catch (error) {
            console.error('Failed to get connection quality:', error);
            return {
                level: 'disconnected',
                latency: 0,
                packetLoss: 0
            };
        }
    }

    /**
     * Get peer connection (for external monitoring)
     */
    getPeerConnection(): RTCPeerConnection | null {
        return this.peerConnection;
    }

    /**
     * Disconnect and cleanup
     */
    disconnect(): void {
        // Stop local tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;
        console.log('WebRTC disconnected and cleaned up');
    }

    // Event handler setters
    onRemoteStream(callback: (stream: MediaStream) => void): void {
        this.onRemoteStreamCallback = callback;
    }

    onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
        this.onConnectionStateCallback = callback;
    }

    onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
        this.onIceCandidateCallback = callback;
    }

    onError(callback: (error: Error) => void): void {
        this.onErrorCallback = callback;
    }
}
