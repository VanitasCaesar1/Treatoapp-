/**
 * SignalingService - Simplified for Patient Mobile App
 * Manages WebSocket connection for video call signaling
 */

export interface SignalingMessage {
    type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left' | 'call-ended';
    roomId: string;
    fromUserId: string;
    toUserId?: string;
    data?: any;
}

export class SignalingService {
    private ws: WebSocket | null = null;
    private roomId: string;
    private userId: string;
    private userName: string;
    private userType: 'patient';
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 2000;
    private isConnecting: boolean = false;

    // Event callbacks
    private onOfferCallback?: (data: any) => void;
    private onAnswerCallback?: (data: any) => void;
    private onIceCandidateCallback?: (data: any) => void;
    private onUserJoinedCallback?: (data: any) => void;
    private onUserLeftCallback?: (data: any) => void;
    private onCallEndedCallback?: () => void;
    private onErrorCallback?: (error: Error) => void;
    private onConnectedCallback?: () => void;

    constructor(roomId: string, userId: string, userName: string) {
        this.roomId = roomId;
        this.userId = userId;
        this.userName = userName;
        this.userType = 'patient';
    }

    /**
     * Connect to WebSocket signaling server
     */
    async connect(): Promise<void> {
        if (this.isConnecting) {
            console.log('Already connecting...');
            return;
        }

        this.isConnecting = true;

        try {
            const wsUrl = this.getWebSocketURL();
            console.log('Connecting to signaling server:', wsUrl);

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.onConnectedCallback?.();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
                this.onErrorCallback?.(new Error('WebSocket connection error'));
            };

            this.ws.onclose = () => {
                console.log('WebSocket closed');
                this.isConnecting = false;
                this.handleReconnect();
            };
        } catch (error) {
            console.error('Failed to connect to signaling server:', error);
            this.isConnecting = false;
            this.onErrorCallback?.(error as Error);
            throw error;
        }
    }

    /**
     * Handle incoming WebSocket message
     */
    private handleMessage(data: string): void {
        try {
            const message: SignalingMessage = JSON.parse(data);
            console.log('Received signaling message:', message.type);

            switch (message.type) {
                case 'offer':
                    this.onOfferCallback?.(message);
                    break;
                case 'answer':
                    this.onAnswerCallback?.(message);
                    break;
                case 'ice-candidate':
                    this.onIceCandidateCallback?.(message);
                    break;
                case 'user-joined':
                    this.onUserJoinedCallback?.(message);
                    break;
                case 'user-left':
                    this.onUserLeftCallback?.(message);
                    break;
                case 'call-ended':
                    this.onCallEndedCallback?.();
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Failed to parse signaling message:', error);
        }
    }

    /**
     * Send WebRTC answer to doctor
     */
    sendAnswer(answer: RTCSessionDescriptionInit, toUserId: string): void {
        this.send({
            type: 'answer',
            roomId: this.roomId,
            fromUserId: this.userId,
            toUserId,
            data: answer
        });
    }

    /**
     * Send ICE candidate to doctor
     */
    sendIceCandidate(candidate: RTCIceCandidate, toUserId: string): void {
        this.send({
            type: 'ice-candidate',
            roomId: this.roomId,
            fromUserId: this.userId,
            toUserId,
            data: {
                candidate: candidate.candidate,
                sdpMid: candidate.sdpMid,
                sdpMLineIndex: candidate.sdpMLineIndex
            }
        });
    }

    /**
     * Join room (notify server that patient has joined)
     */
    joinRoom(): void {
        this.send({
            type: 'user-joined',
            roomId: this.roomId,
            fromUserId: this.userId,
            data: {
                userId: this.userId,
                userName: this.userName,
                userType: this.userType
            }
        });
    }

    /**
     * Leave room
     */
    leaveRoom(): void {
        this.send({
            type: 'user-left',
            roomId: this.roomId,
            fromUserId: this.userId,
            data: { userId: this.userId }
        });
    }

    /**
     * Send message via WebSocket
     */
    private send(message: Partial<SignalingMessage>): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        try {
            this.ws.send(JSON.stringify(message));
            console.log('Sent signaling message:', message.type);
        } catch (error) {
            console.error('Failed to send message:', error);
            this.onErrorCallback?.(error as Error);
        }
    }

    /**
     * Handle reconnection logic
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.onErrorCallback?.(new Error('Failed to reconnect to signaling server'));
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Get WebSocket URL
     */
    private getWebSocketURL(): string {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = process.env.NEXT_PUBLIC_WS_URL?.replace(/^(ws|wss):\/\//, '') ||
            process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^https?:\/\//, '') ||
            'localhost:8080';

        return `${wsProtocol}//${wsHost}/api/v1/ws?room_id=${this.roomId}`;
    }

    /**
     * Disconnect from signaling server
     */
    disconnect(): void {
        if (this.ws) {
            this.leaveRoom();
            this.ws.close();
            this.ws = null;
        }
        console.log('Signaling service disconnected');
    }

    // Event handler setters
    onOffer(callback: (data: any) => void): void {
        this.onOfferCallback = callback;
    }

    onAnswer(callback: (data: any) => void): void {
        this.onAnswerCallback = callback;
    }

    onIceCandidate(callback: (data: any) => void): void {
        this.onIceCandidateCallback = callback;
    }

    onUserJoined(callback: (data: any) => void): void {
        this.onUserJoinedCallback = callback;
    }

    onUserLeft(callback: (data: any) => void): void {
        this.onUserLeftCallback = callback;
    }

    onCallEnded(callback: () => void): void {
        this.onCallEndedCallback = callback;
    }

    onError(callback: (error: Error) => void): void {
        this.onErrorCallback = callback;
    }

    onConnected(callback: () => void): void {
        this.onConnectedCallback = callback;
    }
}
