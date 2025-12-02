'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Heart, MessageCircle, UserPlus, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatTimeAgo } from '@/lib/utils/time';
import Link from 'next/link';

interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'appointment' | 'story_view';
    actor: {
        id: string;
        name: string;
        image?: string;
    };
    post?: {
        id: string;
        thumbnail?: string;
    };
    message: string;
    created_at: string;
    read: boolean;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        // Connect to Erlang WebSocket server
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws';
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            console.log('Connected to notification service');
            // Send auth token
            const token = localStorage.getItem('auth_token');
            if (token) {
                websocket.send(JSON.stringify({
                    type: 'auth',
                    token: token
                }));
            }
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'notification') {
                    const notification: Notification = {
                        id: data.id,
                        type: data.notification_type,
                        actor: data.actor,
                        post: data.post,
                        message: data.message,
                        created_at: data.created_at,
                        read: false,
                    };

                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Show browser notification if permission granted
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(notification.message, {
                            icon: notification.actor.image,
                            badge: '/icon-192.png',
                            tag: notification.id,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to parse notification:', error);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocket.onclose = () => {
            console.log('Disconnected from notification service');
            // Attempt reconnection after 5 seconds
            setTimeout(() => {
                setWs(null);
            }, 5000);
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Send to server
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'mark_read',
                notification_id: notificationId
            }));
        }
    }, [ws]);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'mark_all_read'
            }));
        }
    }, [ws]);

    const requestPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }, []);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        requestPermission,
        isConnected: ws?.readyState === WebSocket.OPEN,
    };
}

export function NotificationBadge() {
    const { unreadCount } = useNotifications();

    if (unreadCount === 0) return null;

    return (
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        </div>
    );
}

export function NotificationsPanel() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const router = useRouter();

    const getIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
            case 'comment':
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case 'follow':
                return <UserPlus className="h-4 w-4 text-green-500" />;
            case 'appointment':
                return <Calendar className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);

        // Navigate based on type
        if (notification.post) {
            router.push(`/post/${notification.post.id}`);
        } else if (notification.type === 'follow') {
            router.push(`/search/${notification.actor.id}`);
        } else if (notification.type === 'appointment') {
            router.push('/appointments');
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div>
                    <h2 className="font-bold text-lg">Notifications</h2>
                    {unreadCount > 0 && (
                        <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-medical-blue font-semibold"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="divide-y max-h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${!notification.read ? 'bg-blue-50' : ''
                                }`}
                        >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={notification.actor.image} />
                                <AvatarFallback className="text-xs">
                                    {notification.actor.name[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">
                                    <span className="font-semibold">{notification.actor.name}</span>{' '}
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatTimeAgo(notification.created_at)}
                                </p>
                            </div>

                            {notification.post?.thumbnail && (
                                <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    <img
                                        src={notification.post.thumbnail}
                                        alt="Post"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>

                            {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
