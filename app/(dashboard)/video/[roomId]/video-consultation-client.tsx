'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWebSocket } from '@/lib/hooks/use-websocket'
import { WebRTCManager, SignalingMessage } from '@/lib/services/webrtc'
import { VideoPlayer } from '@/components/features/video/video-player'
import { VideoControls } from '@/components/features/video/video-controls'
import { ParticipantList, Participant } from '@/components/features/video/participant-list'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'
import { AlertCircle, Video as VideoIcon } from 'lucide-react'

interface VideoConsultationClientProps {
  roomId: string
  userId: string
  userName: string
}

export function VideoConsultationClient({
  roomId,
  userId,
  userName,
}: VideoConsultationClientProps) {
  const router = useRouter()

  const [webrtcManager] = useState(() => new WebRTCManager())
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // WebSocket URL for signaling
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    ? `${process.env.NEXT_PUBLIC_WS_URL}/api/v1/ws?room_id=${roomId}`
    : null

  // WebSocket connection for signaling
  const { isConnected, send, subscribe } = useWebSocket(wsUrl, {
    onOpen: () => {
      console.log('WebSocket connected for video signaling')
    },
    onClose: () => {
      console.log('WebSocket disconnected')
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
      setError('Failed to connect to video server')
    },
  })

  /**
   * Initialize video consultation
   */
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        setIsInitializing(true)
        setError(null)

        // Initialize local media stream
        const stream = await webrtcManager.initializeLocalStream()
        setLocalStream(stream)

        // Set up remote stream handlers
        webrtcManager.onRemoteStream((userId, stream) => {
          console.log('Remote stream added:', userId)
          setRemoteStreams((prev) => new Map(prev).set(userId, stream))
        })

        webrtcManager.onRemoteStreamRemoved((userId) => {
          console.log('Remote stream removed:', userId)
          setRemoteStreams((prev) => {
            const newMap = new Map(prev)
            newMap.delete(userId)
            return newMap
          })
        })

        setIsInitializing(false)
      } catch (err) {
        console.error('Error initializing video:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to access camera/microphone. Please check permissions.'
        )
        setIsInitializing(false)
      }
    }

    initializeVideo()

    return () => {
      webrtcManager.leaveRoom()
    }
  }, [webrtcManager])

  /**
   * Join room when WebSocket is connected
   */
  useEffect(() => {
    if (isConnected && localStream && userId) {
      webrtcManager.joinRoom(roomId, userId, (message: SignalingMessage) => {
        send(message)
      })

      // Add self to participants
      setParticipants((prev) => [
        ...prev.filter((p) => p.userId !== userId),
        {
          id: userId,
          userId,
          userName,
          role: 'patient',
          isAudioEnabled: true,
          isVideoEnabled: true,
          joinedAt: new Date().toISOString(),
        },
      ])
    }
  }, [isConnected, localStream, userId, userName, roomId, webrtcManager, send])

  /**
   * Handle signaling messages
   */
  useEffect(() => {
    const unsubscribeOffer = subscribe('offer', (message: SignalingMessage) => {
      webrtcManager.handleSignalingMessage(message)
    })

    const unsubscribeAnswer = subscribe('answer', (message: SignalingMessage) => {
      webrtcManager.handleSignalingMessage(message)
    })

    const unsubscribeIce = subscribe('ice-candidate', (message: SignalingMessage) => {
      webrtcManager.handleSignalingMessage(message)
    })

    const unsubscribeJoin = subscribe('join', (message: SignalingMessage) => {
      webrtcManager.handleSignalingMessage(message)
      
      // Add participant to list
      if (message.from !== userId) {
        setParticipants((prev) => [
          ...prev.filter((p) => p.userId !== message.from),
          {
            id: message.from,
            userId: message.from,
            userName: message.data?.userName || 'User',
            role: message.data?.role || 'patient',
            isAudioEnabled: true,
            isVideoEnabled: true,
            joinedAt: new Date().toISOString(),
          },
        ])
      }
    })

    const unsubscribeLeave = subscribe('leave', (message: SignalingMessage) => {
      webrtcManager.handleSignalingMessage(message)
      
      // Remove participant from list
      setParticipants((prev) => prev.filter((p) => p.userId !== message.from))
    })

    return () => {
      unsubscribeOffer()
      unsubscribeAnswer()
      unsubscribeIce()
      unsubscribeJoin()
      unsubscribeLeave()
    }
  }, [subscribe, webrtcManager, userId])

  /**
   * Toggle audio
   */
  const handleToggleAudio = useCallback(() => {
    const enabled = webrtcManager.toggleAudio()
    setIsAudioEnabled(enabled)
  }, [webrtcManager])

  /**
   * Toggle video
   */
  const handleToggleVideo = useCallback(() => {
    const enabled = webrtcManager.toggleVideo()
    setIsVideoEnabled(enabled)
  }, [webrtcManager])

  /**
   * End call
   */
  const handleEndCall = useCallback(() => {
    webrtcManager.leaveRoom()
    router.push('/appointments')
  }, [webrtcManager, router])

  // Loading state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Initializing video consultation...</h2>
          <p className="text-sm text-gray-600">Please allow camera and microphone access</p>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 max-w-md">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
          <Button
            onClick={() => router.push('/appointments')}
            variant="outline"
            className="w-full mt-4"
          >
            Back to Appointments
          </Button>
        </Card>
      </div>
    )
  }

  // Main video interface
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <VideoIcon className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Video Consultation</h1>
          </div>
          {!isConnected && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Connecting...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main video area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Remote streams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
                const participant = participants.find((p) => p.userId === userId)
                return (
                  <VideoPlayer
                    key={userId}
                    stream={stream}
                    userName={participant?.userName || 'Remote User'}
                    isMuted={!participant?.isAudioEnabled}
                    isVideoOff={!participant?.isVideoEnabled}
                    className="aspect-video"
                  />
                )
              })}
              
              {remoteStreams.size === 0 && (
                <Card className="aspect-video flex items-center justify-center bg-gray-800 text-gray-400">
                  <div className="text-center">
                    <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Waiting for other participants...</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Local stream (picture-in-picture) */}
            <div className="relative">
              <VideoPlayer
                stream={localStream}
                userName={userName}
                isLocal
                isMuted={!isAudioEnabled}
                isVideoOff={!isVideoEnabled}
                className="w-64 aspect-video"
              />
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <VideoControls
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                onToggleAudio={handleToggleAudio}
                onToggleVideo={handleToggleVideo}
                onEndCall={handleEndCall}
                disabled={!isConnected}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ParticipantList
              participants={participants}
              currentUserId={userId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
