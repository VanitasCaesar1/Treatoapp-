'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Mic, AlertCircle, CheckCircle } from 'lucide-react';

interface PermissionCheckerProps {
    onPermissionsGranted: () => void;
    onPermissionsDenied?: () => void;
}

export function PermissionChecker({ onPermissionsGranted, onPermissionsDenied }: PermissionCheckerProps) {
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        try {
            // Check camera permission
            const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
            setCameraPermission(cameraResult.state as any);

            // Check microphone permission
            const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setMicPermission(micResult.state as any);

            // If both granted, proceed automatically
            if (cameraResult.state === 'granted' && micResult.state === 'granted') {
                onPermissionsGranted();
            }
        } catch (error) {
            console.log('Permission API not supported, will request on demand');
        }
    };

    const requestPermissions = async () => {
        setIsChecking(true);

        try {
            // Request camera and microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Stop tracks immediately (we just wanted to request permission)
            stream.getTracks().forEach(track => track.stop());

            setCameraPermission('granted');
            setMicPermission('granted');

            // Proceed to video call
            onPermissionsGranted();
        } catch (error: any) {
            console.error('Permission error:', error);

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setCameraPermission('denied');
                setMicPermission('denied');
                onPermissionsDenied?.();
            }
        } finally {
            setIsChecking(false);
        }
    };

    const allGranted = cameraPermission === 'granted' && micPermission === 'granted';
    const anyDenied = cameraPermission === 'denied' || micPermission === 'denied';

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Camera & Microphone Access
                    </h2>
                    <p className="text-gray-600">
                        {anyDenied
                            ? 'Permission denied. Please enable camera and microphone in your device settings.'
                            : 'We need access to your camera and microphone for the video call.'
                        }
                    </p>
                </div>

                {/* Permission Status */}
                <div className="space-y-4 mb-6">
                    {/* Camera */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cameraPermission === 'granted' ? 'bg-green-100' :
                                cameraPermission === 'denied' ? 'bg-red-100' : 'bg-gray-200'
                            }`}>
                            {cameraPermission === 'granted' ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : cameraPermission === 'denied' ? (
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            ) : (
                                <Camera className="w-6 h-6 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">Camera</h3>
                            <p className="text-sm text-gray-600">
                                {cameraPermission === 'granted' ? 'Granted' :
                                    cameraPermission === 'denied' ? 'Denied' : 'Not requested'}
                            </p>
                        </div>
                    </div>

                    {/* Microphone */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${micPermission === 'granted' ? 'bg-green-100' :
                                micPermission === 'denied' ? 'bg-red-100' : 'bg-gray-200'
                            }`}>
                            {micPermission === 'granted' ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : micPermission === 'denied' ? (
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            ) : (
                                <Mic className="w-6 h-6 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">Microphone</h3>
                            <p className="text-sm text-gray-600">
                                {micPermission === 'granted' ? 'Granted' :
                                    micPermission === 'denied' ? 'Denied' : 'Not requested'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {!allGranted && (
                    <Button
                        onClick={requestPermissions}
                        disabled={isChecking}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    >
                        {isChecking ? 'Requesting...' : anyDenied ? 'Open Settings' : 'Grant Access'}
                    </Button>
                )}

                {/* Help Text */}
                {anyDenied && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>How to enable:</strong><br />
                            1. Go to your browser settings<br />
                            2. Find "Site permissions"<br />
                            3. Enable Camera and Microphone for this site
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
