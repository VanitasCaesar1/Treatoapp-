export type VideoRoomStatus = 'waiting' | 'active' | 'ended';

export type ParticipantRole = 'patient' | 'doctor';

export interface Participant {
  id: string;
  userId: string;
  userName: string;
  role: ParticipantRole;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  joinedAt: string;
}

export interface VideoRoom {
  id: string;
  name: string;
  appointmentId?: string;
  maxUsers: number;
  participants: Participant[];
  status: VideoRoomStatus;
  createdAt: string;
}

export interface CreateVideoRoomInput {
  name: string;
  appointmentId?: string;
  maxUsers?: number;
}

export interface TURNCredentials {
  urls: string[];
  username: string;
  credential: string;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}
