'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WebRTCService, ConnectionQuality } from '@/lib/services/webrtc/WebRTCService';
import { SignalingService } from '@/lib/services/webrtc/SignalingService';
import { MediaService } from '@/lib/services/webrtc/MediaService';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface PatientVideoRoomProps {
    roomId: string;
    userId: string;
    userName: string;
    doctorName?: string;
    onCallEnd: () => void;
    onError?: (error: string) => void;
}

interface VideoCallState {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isConnected: boolean;
    isConnecting: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    callDuration: number;
    error: string | null;
}

export const PatientVideoRoom: React.FC<PatientVideoRoomProps> = ({
    roomId,
    userId,
    userName,
    doctorName,
    onCallEnd,
    onError
}) => {
    // Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const webrtcServiceRef = useRef<WebRTCService | null>(null);
    const signalingServiceRef = useRef<SignalingService | null>(null);
    const mediaServiceRef = useRef<MediaService | null>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);

    // State
    const [state, setState] = useState<VideoCallState>({
        localStream: null,
        remoteStream: null,
        isConnected: false,
        isConnecting: false,
        isMuted: false,
        isVideoOff: false,
        callDuration: 0,
        error: null
    });

    /**
     * Initialize video call
     */
    const initializeCall = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isConnecting: true, error: null }));

            // Initialize services
            webrtcServiceRef.current = new WebRTCService(roomId, userId);
            signalingServiceRef.current = new SignalingService(roomId, userId, userName);
            mediaServiceRef.current = new MediaService();

            // Connect to signaling server
            await signalingServiceRef.current.connect();

            // Set up event handlers
            setupWebRTCEventHandlers();
            setupSignalingEventHandlers();

            // Initialize WebRTC connection
            await webrtcServiceRef.current.initializeConnection();

            // Get user media
            const stream = await webrtcServiceRef.current.getUserMedia();
            setState(prev => ({ ...prev, localStream: stream }));

            // Set local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Join the room
            signalingServiceRef.current.joinRoom();

            // Start call timer
            startCallTimer();

            setState(prev => ({ ...prev, isConnecting: false }));
        } catch (error: any) {
            console.error('Failed to initialize call:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to join video call',
                isConnecting: false
            }));
            onError?.(error.message);
        }
    }, [roomId, userId, userName, onError]);

    /**
     * Setup WebRTC event handlers
     */
    const setupWebRTCEventHandlers = useCallback(() => {
        if (!webrtcServiceRef.current) return;

        webrtcServiceRef.current.onRemoteStream((stream) => {
            console.log('Received remote stream');
            setState(prev => ({ ...prev, remoteStream: stream }));
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        });

        webrtcServiceRef.current.onConnectionStateChange((connectionState) => {
            console.log('Connection state:', connectionState);
            setState(prev => ({ ...prev, isConnected: connectionState === 'connected' }));
        });

        webrtcServiceRef.current.onIceCandidate((candidate) => {
            // Send ICE candidate to doctor (we assume doctor is the only other participant)
            signalingServiceRef.current?.sendIceCandidate(candidate, 'doctor');
        });

        webrtcServiceRef.current.onError((error) => {
            console.error('WebRTC error:', error);
            setState(prev => ({ ...prev, error: error.message }));
            onError?.(error.message);
        });
    }, [onError]);

    /**
     * Setup signaling event handlers
     */
    const setupSignalingEventHandlers = useCallback(() => {
        if (!signalingServiceRef.current) return;

        // Handle doctor's offer
        signalingServiceRef.current.onOffer(async (data) => {
            console.log('Received offer from doctor');
            try {
                if (webrtcServiceRef.current) {
                    const answer = await webrtcServiceRef.current.createAnswer(data.data);
                    signalingServiceRef.current?.sendAnswer(answer, data.fromUserId);
                }
            } catch (error) {
                console.error('Failed to handle offer:', error);
            }
        });

        // Handle ICE candidates
        signalingServiceRef.current.onIceCandidate(async (data) => {
            try {
                if (webrtcServiceRef.current) {
                    await webrtcServiceRef.current.addIceCandidate(data.data);
                }
            } catch (error) {
                console.error('Failed to add ICE candidate:', error);
            }
        });

        // Handle user joined
        signalingServiceRef.current.onUserJoined((data) => {
            console.log('User joined:', data);
        });

        // Handle call ended
        signalingServiceRef.current.onCallEnded(() => {
            console.log('Call ended by doctor');
            endCall();
        });

        // Handle errors
        signalingServiceRef.current.onError((error) => {
            console.error('Signaling error:', error);
            setState(prev => ({ ...prev, error: error.message }));
            onError?.(error.message);
        });
    }, [onError]);

    /**
     * Start call timer
     */
    const startCallTimer = useCallback(() => {
        callTimerRef.current = setInterval(() => {
            setState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }));
        }, 1000);
    }, []);

    /**
     * Format call duration
     */
    const formatDuration = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    /**
     * Toggle audio (mute/unmute)
     */
    const toggleAudio = useCallback(async () => {
        try {
            if (webrtcServiceRef.current) {
                const isEnabled = await webrtcServiceRef.current.toggleAudio();
                setState(prev => ({ ...prev, isMuted: !isEnabled }));
                await Haptics.impact({ style: ImpactStyle.Light });
            }
        } catch (error) {
            console.error('Failed to toggle audio:', error);
        }
    }, []);

    /**
     * Toggle video (enable/disable camera)
     */
    const toggleVideo = useCallback(async () => {
        try {
            if (webrtcServiceRef.current) {
                const isEnabled = await webrtcServiceRef.current.toggleVideo();
                setState(prev => ({ ...prev, isVideoOff: !isEnabled }));
                await Haptics.impact({ style: ImpactStyle.Light });
            }
        } catch (error) {
            console.error('Failed to toggle video:', error);
        }
    }, []);

    /**
     * End call
     */
    const endCall = useCallback(() => {
        // Stop timer
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }

        // Cleanup services
        webrtcServiceRef.current?.disconnect();
        signalingServiceRef.current?.disconnect();
        mediaServiceRef.current?.cleanup();

        // Haptic feedback
        Haptics.impact({ style: ImpactStyle.Medium });

        onCallEnd();
    }, [onCallEnd]);

    // Initialize call on mount
    useEffect(() => {
        initializeCall();

        // Cleanup on unmount
        return () => {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
            webrtcServiceRef.current?.disconnect();
            signalingServiceRef.current?.disconnect();
            mediaServiceRef.current?.cleanup();
        };
    }, [initializeCall]);

    // Loading state
    if (state.isConnecting) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Connecting...</h3>
                    <p className="text-gray-400">Please wait while we connect you to the call</p>
                </div>
            </div>
        );
    }

    // Error state
    if (state.error && !state.remoteStream) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <WifiOff className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
                    <p className="text-gray-400 mb-6">{state.error}</p>
                    <div className="flex gap-3">
                        <Button onClick={initializeCall} variant="outline" className="flex-1">
                            Try Again
                        </Button>
                        <Button onClick={endCall} variant="destructive" className="flex-1">
                            End Call
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black">
            {/* Remote video (doctor's feed - main view) */}
            <div className="absolute inset-0">
                {state.remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                                <AvatarFallback className="text-2xl bg-gray-700 text-white">
                                    {doctorName?.charAt(0)?.toUpperCase() || 'D'}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-white text-lg">
                                Waiting for {doctorName || 'doctor'} to join...
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Local video (patient's feed - picture-in-picture) */}
            <div className="absolute top-4 right-4 w-32 h-44 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                {state.localStream && !state.isVideoOff ? (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-gray-600 text-white">
                                {userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                )}
            </div>

            {/* Top bar with call info */}
            <div className="absolute top-4 left-4 right-48 z-10">
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">
                        {formatDuration(state.callDuration)}
                    </span>
                    {state.isConnected ? (
                        <Wifi className="h-4 w-4 text-green-500 ml-2" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-yellow-500 ml-2" />
                    )}
                </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center gap-4 bg-black/70 backdrop-blur-md rounded-full px-6 py-4">
                    {/* Mute button */}
                    <Button
                        onClick={toggleAudio}
                        size="lg"
                        variant={state.isMuted ? "destructive" : "secondary"}
                        className="rounded-full h-14 w-14 p-0"
                    >
                        {state.isMuted ? (
                            <MicOff className="h-6 w-6" />
                        ) : (
                            <Mic className="h-6 w-6" />
                        )}
                    </Button>

                    {/* Video button */}
                    <Button
                        onClick={toggleVideo}
                        size="lg"
                        variant={state.isVideoOff ? "destructive" : "secondary"}
                        className="rounded-full h-14 w-14 p-0"
                    >
                        {state.isVideoOff ? (
                            <VideoOff className="h-6 w-6" />
                        ) : (
                            <Video className="h-6 w-6" />
                        )}
                    </Button>

                    {/* End call button */}
                    <Button
                        onClick={endCall}
                        size="lg"
                        variant="destructive"
                        className="rounded-full h-16 w-16 p-0 bg-red-600 hover:bg-red-700"
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
