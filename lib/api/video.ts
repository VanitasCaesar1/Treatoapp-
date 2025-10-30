import { apiClient } from './client';
import {
  VideoRoom,
  CreateVideoRoomInput,
  Participant,
  TURNCredentials,
  WebRTCConfig,
} from '@/lib/types/video';

/**
 * Create a new video room
 */
export async function createVideoRoom(
  input: CreateVideoRoomInput
): Promise<VideoRoom> {
  return apiClient.post<VideoRoom>('/api/v1/rooms', input);
}

/**
 * Get video room details by ID
 */
export async function getVideoRoom(roomId: string): Promise<VideoRoom> {
  return apiClient.get<VideoRoom>(`/api/v1/rooms/${roomId}`);
}

/**
 * Get participants in a video room
 */
export async function getVideoRoomParticipants(
  roomId: string
): Promise<Participant[]> {
  return apiClient.get<Participant[]>(`/api/v1/rooms/${roomId}/participants`);
}

/**
 * Get TURN server credentials for WebRTC
 */
export async function getTURNCredentials(): Promise<TURNCredentials> {
  return apiClient.get<TURNCredentials>('/api/v1/turn/credentials');
}

/**
 * Join a video room
 */
export async function joinVideoRoom(roomId: string): Promise<VideoRoom> {
  return apiClient.post<VideoRoom>(`/api/v1/rooms/${roomId}/join`);
}

/**
 * Leave a video room
 */
export async function leaveVideoRoom(roomId: string): Promise<void> {
  return apiClient.post<void>(`/api/v1/rooms/${roomId}/leave`);
}

/**
 * Get WebSocket URL for video signaling
 */
export function getVideoWebSocketURL(roomId: string): string {
  const wsBaseURL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
  return `${wsBaseURL}/api/v1/ws?room_id=${roomId}`;
}
