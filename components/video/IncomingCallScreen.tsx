'use client';

import React, { useEffect, useState } from 'react';
import { useCallNotification } from '@/components/providers/CallNotificationProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function IncomingCallScreen() {
    const { incomingCall, acceptCall, declineCall } = useCallNotification();
    const [isRinging, setIsRinging] = useState(false);

    useEffect(() => {
        if (incomingCall) {
            setIsRinging(true);

            // Vibration pattern (like phone call)
            const vibratePattern = setInterval(() => {
                if ('vibrate' in navigator) {
                    navigator.vibrate([500, 200, 500]);
                }
            }, 2000);

            return () => {
                clearInterval(vibratePattern);
                setIsRinging(false);
            };
        }
    }, [incomingCall]);

    const handleAccept = async () => {
        await Haptics.impact({ style: ImpactStyle.Medium });
        acceptCall();
    };

    const handleDecline = async () => {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        declineCall();
    };

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center">
            {/* Doctor Avatar */}
            <div className="mb-8">
                <div className={`relative ${isRinging ? 'animate-pulse' : ''}`}>
                    <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                        {incomingCall.doctorImage ? (
                            <AvatarImage src={incomingCall.doctorImage} alt={incomingCall.doctorName} />
                        ) : (
                            <AvatarFallback className="text-4xl bg-blue-500 text-white">
                                {incomingCall.doctorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    {/* Ripple effect */}
                    <div className="absolute inset-0 -m-4">
                        <div className="absolute inset-0 rounded-full border-4 border-white opacity-75 animate-ping" />
                        <div className="absolute inset-0 rounded-full border-4 border-white opacity-50 animate-ping" style={{ animationDelay: '0.5s' }} />
                    </div>
                </div>
            </div>

            {/* Doctor Name */}
            <h2 className="text-3xl font-bold text-white mb-2">
                {incomingCall.doctorName}
            </h2>

            {/* Call Type */}
            <p className="text-xl text-blue-100 mb-12">
                Incoming Video Call
            </p>

            {/* Action Buttons */}
            <div className="flex gap-20 items-center">
                {/* Decline Button */}
                <button
                    onClick={handleDecline}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-600 transition-all group-active:scale-95">
                        <PhoneOff className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium">Decline</span>
                </button>

                {/* Accept Button */}
                <button
                    onClick={handleAccept}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-green-600 transition-all group-active:scale-95 animate-pulse">
                        <Phone className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium">Accept</span>
                </button>
            </div>

            {/* Incoming animation text */}
            <div className="absolute bottom-20 text-center">
                <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-sm">●</span>
                    <span className="text-sm animate-pulse">Ringing...</span>
                    <span className="text-sm">●</span>
                </div>
            </div>
        </div>
    );
}
