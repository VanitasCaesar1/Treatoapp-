'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'

interface VideoPlayerProps {
  stream: MediaStream | null
  userName: string
  isLocal?: boolean
  isMuted?: boolean
  isVideoOff?: boolean
  className?: string
}

export function VideoPlayer({
  stream,
  userName,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <Card className={`relative overflow-hidden bg-gray-900 ${className}`}>
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isMuted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Avatar className="w-24 h-24">
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-2xl font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </Avatar>
        </div>
      )}

      {/* User name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">
            {userName} {isLocal && '(You)'}
          </span>
          <div className="flex items-center gap-2">
            {isMuted ? (
              <MicOff className="w-4 h-4 text-red-500" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
            {isVideoOff ? (
              <VideoOff className="w-4 h-4 text-red-500" />
            ) : (
              <Video className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
