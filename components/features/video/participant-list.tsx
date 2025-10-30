'use client'

import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Video, VideoOff, User } from 'lucide-react'

export interface Participant {
  id: string
  userId: string
  userName: string
  role: 'patient' | 'doctor'
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  joinedAt: string
}

interface ParticipantListProps {
  participants: Participant[]
  currentUserId?: string
  className?: string
}

export function ParticipantList({
  participants,
  currentUserId,
  className = '',
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No participants yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-sm font-semibold mb-3 text-gray-700">
        Participants ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((participant) => {
          const isCurrentUser = participant.userId === currentUserId

          return (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 font-semibold">
                  {participant.userName.charAt(0).toUpperCase()}
                </div>
              </Avatar>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {participant.userName}
                    {isCurrentUser && ' (You)'}
                  </p>
                  <Badge
                    variant={participant.role === 'doctor' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {participant.role}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Media status */}
              <div className="flex items-center gap-1">
                {participant.isAudioEnabled ? (
                  <Mic className="w-4 h-4 text-green-600" />
                ) : (
                  <MicOff className="w-4 h-4 text-red-500" />
                )}
                {participant.isVideoEnabled ? (
                  <Video className="w-4 h-4 text-green-600" />
                ) : (
                  <VideoOff className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
