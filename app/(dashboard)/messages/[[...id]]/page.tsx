'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Image as ImageIcon, Smile, MoreVertical } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils/time';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    media_url?: string;
    created_at: string;
    read: boolean;
}

interface Chat {
    id: string;
    user: {
        id: string;
        name: string;
        image?: string;
        is_online?: boolean;
    };
    last_message?: string;
    unread_count: number;
    updated_at: string;
}

export default function DirectMessagesPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const chatId = params.id as string | undefined;

    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // WebSocket for real-time messages
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws';
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            const token = localStorage.getItem('auth_token');
            websocket.send(JSON.stringify({
                type: 'authenticate',
                user_id: 'current_user_id', // Get from auth context
            }));

            if (chatId) {
                websocket.send(JSON.stringify({
                    type: 'subscribe',
                    channels: [`chat:${chatId}`]
                }));
            }
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message' && data.data.chat_id === chatId) {
                queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            }
        };

        setWs(websocket);
        return () => websocket.close();
    }, [chatId, queryClient]);

    // Fetch chats list
    const { data: chats } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => {
            const response = await api.get('/messages/chats');
            return response.data || [];
        },
    });

    // Fetch messages for selected chat
    const { data: messages } = useQuery({
        queryKey: ['messages', chatId],
        queryFn: async () => {
            if (!chatId) return [];
            const response = await api.get(`/messages/chats/${chatId}`);
            return response.data || [];
        },
        enabled: !!chatId,
    });

    // Send message mutation
    const sendMessage = useMutation({
        mutationFn: async (content: string) => {
            return await api.post(`/messages/chats/${chatId}/send`, { content });
        },
        onSuccess: () => {
            setMessageText('');
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        },
    });

    const handleSend = () => {
        if (messageText.trim() && chatId) {
            sendMessage.mutate(messageText);
        }
    };

    const selectedChat = chats?.find((c: Chat) => c.id === chatId);

    return (
        <div className="h-screen flex bg-white">
            {/* Chats List Sidebar */}
            <div className={`w-full md:w-80 border-r flex-shrink-0 ${chatId ? 'hidden md:flex' : 'flex'} flex-col`}>
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="font-bold text-xl">Messages</h1>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats?.map((chat: Chat) => (
                        <button
                            key={chat.id}
                            onClick={() => router.push(`/messages/${chat.id}`)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${chatId === chat.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="relative">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={chat.user.image} />
                                    <AvatarFallback>{chat.user.name[0]}</AvatarFallback>
                                </Avatar>
                                {chat.user.is_online && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">{chat.user.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {formatTimeAgo(chat.updated_at)}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                    {chat.last_message}
                                </p>
                            </div>

                            {chat.unread_count > 0 && (
                                <div className="h-5 w-5 bg-medical-blue rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                        {chat.unread_count}
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages Area */}
            {chatId && selectedChat ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b flex items-center gap-3">
                        <button
                            onClick={() => router.push('/messages')}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedChat.user.image} />
                            <AvatarFallback>{selectedChat.user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <p className="font-semibold">{selectedChat.user.name}</p>
                            <p className="text-xs text-gray-500">
                                {selectedChat.user.is_online ? 'Active now' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages?.map((message: Message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender_id === 'current_user_id' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.sender_id === 'current_user_id'
                                            ? 'bg-medical-blue text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    {message.media_url && (
                                        <img
                                            src={message.media_url}
                                            alt="Attachment"
                                            className="rounded-lg mb-2 max-w-full"
                                        />
                                    )}
                                    <p className="text-sm">{message.content}</p>
                                    <p className={`text-[10px] mt-1 ${message.sender_id === 'current_user_id' ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        {formatTimeAgo(message.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <ImageIcon className="h-5 w-5 text-gray-600" />
                            </button>

                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-gray-50"
                            />

                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <Smile className="h-5 w-5 text-gray-600" />
                            </button>

                            <button
                                onClick={handleSend}
                                disabled={!messageText.trim()}
                                className="p-2 bg-medical-blue text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">Your Messages</p>
                        <p className="text-sm text-gray-500">
                            Send private messages to doctors and patients
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
