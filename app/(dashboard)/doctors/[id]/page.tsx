'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useDoctor, useDoctorSchedules, useDoctorFees } from '@/lib/hooks/use-doctors';
import { DoctorProfileHeader } from '@/components/features/doctors/doctor-profile-header';
import { ScheduleViewer } from '@/components/features/doctors/schedule-viewer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';

interface DoctorProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const { id } = use(params);

  const {
    data: doctor,
    isLoading: isDoctorLoading,
    error: doctorError,
    refetch: refetchDoctor,
  } = useDoctor(id);

  const {
    data: schedules,
    isLoading: isSchedulesLoading,
  } = useDoctorSchedules(id);

  const {
    data: fees,
    isLoading: isFeesLoading,
  } = useDoctorFees(id);

  if (doctorError) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage
          message="Failed to load doctor profile. Please try again."
          onRetry={() => refetchDoctor()}
        />
      </div>
    );
  }

  if (isDoctorLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Doctor not found</h2>
          <p className="text-muted-foreground mb-4">
            The doctor you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/doctors">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/doctors" aria-label="Back to search">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Doctor Profile</h1>
          <p className="text-sm text-muted-foreground">
            View detailed information and schedule
          </p>
        </div>
      </div>

      <DoctorProfileHeader doctor={doctor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isSchedulesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <ScheduleViewer
              schedules={schedules || []}
              fees={isFeesLoading ? undefined : fees}
            />
          )}
        </div>

        <div className="space-y-4">
          <Button className="w-full" size="lg" asChild>
            <Link href={`/appointments/book?doctorId=${doctor.id}`}>
              Book Appointment
            </Link>
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            <p>Available for consultation</p>
            <p>Response time: Usually within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
