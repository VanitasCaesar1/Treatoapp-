'use client'

import { Button } from '@/components/ui/button'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings } from 'lucide-react'

interface VideoControlsProps {
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onEndCall: () => void
  onSettings?: () => void
  disabled?: boolean
}

export function VideoControls({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onSettings,
  disabled = false,
}: VideoControlsProps) {
  return (
    <div 
      className="flex items-center justify-center gap-4 p-4 bg-gray-900/90 backdrop-blur-sm rounded-lg"
      role="toolbar"
      aria-label="Video call controls"
    >
      {/* Audio toggle */}
      <Button
        variant={isAudioEnabled ? 'default' : 'destructive'}
        size="lg"
        onClick={onToggleAudio}
        disabled={disabled}
        className="rounded-full w-14 h-14"
        aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        aria-pressed={isAudioEnabled}
      >
        {isAudioEnabled ? (
          <Mic className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MicOff className="w-6 h-6" aria-hidden="true" />
        )}
      </Button>

      {/* Video toggle */}
      <Button
        variant={isVideoEnabled ? 'default' : 'destructive'}
        size="lg"
        onClick={onToggleVideo}
        disabled={disabled}
        className="rounded-full w-14 h-14"
        aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        aria-pressed={isVideoEnabled}
      >
        {isVideoEnabled ? (
          <Video className="w-6 h-6" aria-hidden="true" />
        ) : (
          <VideoOff className="w-6 h-6" aria-hidden="true" />
        )}
      </Button>

      {/* End call */}
      <Button
        variant="destructive"
        size="lg"
        onClick={onEndCall}
        disabled={disabled}
        className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
        aria-label="End call"
      >
        <PhoneOff className="w-6 h-6" aria-hidden="true" />
      </Button>

      {/* Settings (optional) */}
      {onSettings && (
        <Button
          variant="outline"
          size="lg"
          onClick={onSettings}
          disabled={disabled}
          className="rounded-full w-14 h-14"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
