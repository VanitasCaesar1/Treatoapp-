'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientVideoRoom } from '@/components/video/PatientVideoRoom';
import { PermissionChecker } from '@/components/video/PermissionChecker';
import { useAuth } from '@workos-inc/authkit-react';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function VideoRoomPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const handleCallEnd = () => {
    // Navigate back to appointments after call ends
    router.push('/appointments');
  };

  const handleError = (error: string) => {
    console.error('Video call error:', error);
  };

  const handlePermissionsDenied = () => {
    // User denied permissions, can't proceed
    console.error('Permissions denied');
    // Optionally redirect back
    setTimeout(() => {
      router.push('/appointments');
    }, 3000);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Show permission checker first
  if (!permissionsGranted) {
    return (
      <PermissionChecker
        onPermissionsGranted={() => setPermissionsGranted(true)}
        onPermissionsDenied={handlePermissionsDenied}
      />
    );
  }

  // Permissions granted, show video room
  return (
    <PatientVideoRoom
      roomId={unwrappedParams.roomId}
      userId={user.id}
      userName={user.firstName || user.email || 'Patient'}
      onCallEnd={handleCallEnd}
      onError={handleError}
    />
  );
}
