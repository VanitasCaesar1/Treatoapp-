'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface IncomingCall {
    roomId: string;
    doctorId: string;
    doctorName: string;
    patientId: string;
}

interface CallNotificationContextType {
    incomingCall: IncomingCall | null;
    acceptCall: () => void;
    declineCall: () => void;
}

const CallNotificationContext = createContext<CallNotificationContextType | undefined>(undefined);

export function CallNotificationProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    // Fetch user ID from session
    useEffect(() => {
        fetch('/api/auth/session', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data?.user?.id) {
                    setUserId(data.user.id);
                }
            })
            .catch(err => console.error('Failed to fetch user session:', err));
    }, []);

    /**
     * Connect to WebSocket for call notifications
     */
    useEffect(() => {
        if (!userId) return;

        const connectWebSocket = () => {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = process.env.NEXT_PUBLIC_WS_URL?.replace(/^(ws|wss):\/\//, '') ||
                process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^https?:\/\//, '') ||
                'localhost:8080';

            const wsUrl = `${wsProtocol}//${wsHost}/api/v1/notifications?userId=${userId}`;

            console.log('Connecting to call notifications WebSocket:', wsUrl);

            const websocket = new WebSocket(wsUrl);

            websocket.onopen = () => {
                console.log('Call notifications WebSocket connected');
            };

            websocket.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    console.log('Received call notification:', notification);

                    if (notification.type === 'incoming_call') {
                        setIncomingCall({
                            roomId: notification.roomId,
                            doctorId: notification.doctorId,
                            doctorName: notification.doctorName,
                            patientId: notification.patientId,
                        });

                        // Vibrate if supported
                        if ('vibrate' in navigator) {
                            navigator.vibrate([200, 100, 200]);
                        }
                    } else if (notification.type === 'call_ended') {
                        // Clear incoming call if it was ended
                        setIncomingCall(null);
                    }
                } catch (error) {
                    console.error('Failed to parse notification:', error);
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            websocket.onclose = () => {
                console.log('WebSocket closed, reconnecting in 5s...');
                setTimeout(connectWebSocket, 5000);
            };

            setWs(websocket);
        };

        connectWebSocket();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [userId]);

    const acceptCall = useCallback(() => {
        if (incomingCall) {
            // Navigate to video room
            window.location.href = `/video/${incomingCall.roomId}`;
            setIncomingCall(null);
        }
    }, [incomingCall]);

    const declineCall = useCallback(() => {
        if (incomingCall) {
            // Send decline message to backend (optional)
            console.log('Call declined:', incomingCall.roomId);
            setIncomingCall(null);
        }
    }, [incomingCall]);

    return (
        <CallNotificationContext.Provider value={{ incomingCall, acceptCall, declineCall }}>
            {children}
        </CallNotificationContext.Provider>
    );
}

export function useCallNotification() {
    const context = useContext(CallNotificationContext);
    if (!context) {
        throw new Error('useCallNotification must be used within CallNotificationProvider');
    }
    return context;
}
