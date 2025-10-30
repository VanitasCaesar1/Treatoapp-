/**
 * WebRTC Manager Service
 * Handles peer connection management, media streams, and signaling for video consultations
 */

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave'
  from: string
  to?: string
  data?: any
}

export interface MediaStreamState {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private remoteStreams: Map<string, MediaStream> = new Map()
  private config: WebRTCConfig
  private roomId: string | null = null
  private userId: string | null = null
  private onRemoteStreamCallback?: (userId: string, stream: MediaStream) => void
  private onRemoteStreamRemovedCallback?: (userId: string) => void
  private sendSignalingMessage?: (message: SignalingMessage) => void

  constructor(config?: Partial<WebRTCConfig>) {
    this.config = {
      iceServers: config?.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    }
  }

  /**
   * Initialize local media stream
   */
  async initializeLocalStream(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        }
      )

      this.localStream = stream
      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw new Error('Failed to access camera/microphone. Please check permissions.')
    }
  }

  /**
   * Create a peer connection for a specific user
   */
  private createPeerConnection(userId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.config)

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      this.remoteStreams.set(userId, remoteStream)
      this.onRemoteStreamCallback?.(userId, remoteStream)
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.sendSignalingMessage) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.userId!,
          to: userId,
          data: event.candidate,
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, peerConnection.connectionState)
      
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed') {
        this.removePeerConnection(userId)
      }
    }

    this.peerConnections.set(userId, peerConnection)
    return peerConnection
  }

  /**
   * Join a video room
   */
  async joinRoom(
    roomId: string,
    userId: string,
    sendMessage: (message: SignalingMessage) => void
  ): Promise<void> {
    this.roomId = roomId
    this.userId = userId
    this.sendSignalingMessage = sendMessage

    // Initialize local stream if not already done
    if (!this.localStream) {
      await this.initializeLocalStream()
    }

    // Send join message to signal presence
    sendMessage({
      type: 'join',
      from: userId,
    })
  }

  /**
   * Handle incoming signaling messages
   */
  async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    const { type, from, data } = message

    switch (type) {
      case 'join':
        // Another user joined, create offer
        await this.createOffer(from)
        break

      case 'offer':
        await this.handleOffer(from, data)
        break

      case 'answer':
        await this.handleAnswer(from, data)
        break

      case 'ice-candidate':
        await this.handleIceCandidate(from, data)
        break

      case 'leave':
        this.removePeerConnection(from)
        break

      default:
        console.warn('Unknown signaling message type:', type)
    }
  }

  /**
   * Create and send an offer to a peer
   */
  private async createOffer(userId: string): Promise<void> {
    try {
      const peerConnection = this.createPeerConnection(userId)
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      this.sendSignalingMessage?.({
        type: 'offer',
        from: this.userId!,
        to: userId,
        data: offer,
      })
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  /**
   * Handle incoming offer
   */
  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peerConnection = this.createPeerConnection(userId)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      this.sendSignalingMessage?.({
        type: 'answer',
        from: this.userId!,
        to: userId,
        data: answer,
      })
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  /**
   * Handle incoming answer
   */
  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(userId)
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      }
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(userId)
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error)
    }
  }

  /**
   * Remove peer connection
   */
  private removePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(userId)
    }

    const remoteStream = this.remoteStreams.get(userId)
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
      this.remoteStreams.delete(userId)
      this.onRemoteStreamRemovedCallback?.(userId)
    }
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio(): boolean {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      return audioTrack.enabled
    }
    return false
  }

  /**
   * Toggle video on/off
   */
  toggleVideo(): boolean {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      return videoTrack.enabled
    }
    return false
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Get all remote streams
   */
  getRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams
  }

  /**
   * Get media state
   */
  getMediaState(): MediaStreamState {
    const audioTrack = this.localStream?.getAudioTracks()[0]
    const videoTrack = this.localStream?.getVideoTracks()[0]

    return {
      localStream: this.localStream,
      remoteStreams: this.remoteStreams,
      isAudioEnabled: audioTrack?.enabled ?? false,
      isVideoEnabled: videoTrack?.enabled ?? false,
    }
  }

  /**
   * Set callback for remote stream events
   */
  onRemoteStream(callback: (userId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback
  }

  /**
   * Set callback for remote stream removed events
   */
  onRemoteStreamRemoved(callback: (userId: string) => void): void {
    this.onRemoteStreamRemovedCallback = callback
  }

  /**
   * Leave room and cleanup
   */
  leaveRoom(): void {
    // Send leave message
    if (this.sendSignalingMessage && this.userId) {
      this.sendSignalingMessage({
        type: 'leave',
        from: this.userId,
      })
    }

    // Close all peer connections
    this.peerConnections.forEach((pc) => pc.close())
    this.peerConnections.clear()

    // Stop all remote streams
    this.remoteStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop())
    })
    this.remoteStreams.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    this.roomId = null
    this.userId = null
    this.sendSignalingMessage = undefined
  }

  /**
   * Check if audio is enabled
   */
  isAudioEnabled(): boolean {
    const audioTrack = this.localStream?.getAudioTracks()[0]
    return audioTrack?.enabled ?? false
  }

  /**
   * Check if video is enabled
   */
  isVideoEnabled(): boolean {
    const videoTrack = this.localStream?.getVideoTracks()[0]
    return videoTrack?.enabled ?? false
  }
}

// Export singleton instance
export const webrtcManager = new WebRTCManager()
