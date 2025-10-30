import { withAuth } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'
import { VideoConsultationClient } from '@/app/(dashboard)/video/[roomId]/video-consultation-client'

export default async function VideoConsultationPage({
  params,
}: {
  params: { roomId: string }
}) {
  const { user } = await withAuth()

  if (!user) {
    redirect('/login')
  }

  return (
    <VideoConsultationClient
      roomId={params.roomId}
      userId={user.id}
      userName={user.firstName || user.email || 'User'}
    />
  )
}
