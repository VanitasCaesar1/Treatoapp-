'use client';

import { useSearchParams } from 'next/navigation';
import { useDoctor } from '@/lib/hooks/use-doctors';
import { BookingForm } from '@/components/features/appointments/booking-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookAppointmentPage() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  const {
    data: doctor,
    isLoading,
    error,
    refetch,
  } = useDoctor(doctorId || '', {
    enabled: !!doctorId,
  });

  if (!doctorId) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage
          message="No doctor selected. Please select a doctor first."
        />
        <Link
          href="/doctors"
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Doctors
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage
          message={error?.message || 'Failed to load doctor information'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/doctors/${doctorId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
        <p className="text-muted-foreground mt-2">
          Schedule a consultation with {doctorName}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor.profileImage} alt={doctorName} />
              <AvatarFallback>
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{doctorName}</h2>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {doctor.yearsOfExperience} years experience
                </Badge>
                {doctor.rating && (
                  <Badge variant="secondary">
                    ⭐ {doctor.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BookingForm doctorId={doctorId} doctorName={doctorName} />
    </div>
  );
}
