'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppointment, useCancelAppointment } from '@/lib/hooks/use-appointments';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  ArrowLeft,
  X,
  FileText,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const consultationTypeIcons = {
  video: Video,
  phone: Phone,
  'in-person': MapPin,
};

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: appointment,
    isLoading,
    error,
    refetch,
  } = useAppointment(appointmentId);

  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment({
    onSuccess: () => {
      toast.success('Appointment cancelled successfully');
      setShowCancelDialog(false);
      router.push('/appointments');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage
          message={error?.message || 'Failed to load appointment details'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const doctorName = appointment.doctor
    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : 'Doctor';

  const ConsultationIcon = consultationTypeIcons[appointment.consultationType];

  const appointmentDateTime = new Date(
    `${appointment.appointmentDate}T${appointment.appointmentTime}`
  );
  const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const canCancel =
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed' &&
    appointmentDateTime > new Date();

  const canJoinVideo =
    appointment.consultationType === 'video' &&
    appointment.status === 'confirmed' &&
    appointment.videoRoomId;

  const handleCancelAppointment = () => {
    cancelAppointment(appointmentId);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/appointments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
          <p className="text-muted-foreground mt-2">
            View your appointment information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canJoinVideo && (
            <Button asChild>
              <Link href={`/video/${appointment.videoRoomId}`}>
                <Video className="h-4 w-4 mr-2" />
                Join Video Call
              </Link>
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointment Information</CardTitle>
                <Badge
                  variant="secondary"
                  className={statusColors[appointment.status]}
                >
                  {appointment.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedTime} ({appointment.duration} min)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ConsultationIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Consultation Type</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.consultationType.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Appointment ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {appointment.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </div>

              {appointment.reason && (
                <div>
                  <p className="text-sm font-medium mb-2">Reason for Visit</p>
                  <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                </div>
              )}

              {appointment.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Additional Notes</p>
                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.doctor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={appointment.doctor.profileImage}
                        alt={doctorName}
                      />
                      <AvatarFallback>
                        {appointment.doctor.firstName[0]}
                        {appointment.doctor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{doctorName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor.specialty}
                      </p>
                    </div>
                  </div>

                  {appointment.doctor.yearsOfExperience && (
                    <div className="text-sm">
                      <span className="font-medium">Experience:</span>{' '}
                      {appointment.doctor.yearsOfExperience} years
                    </div>
                  )}

                  {appointment.doctor.rating && (
                    <div className="text-sm">
                      <span className="font-medium">Rating:</span>{' '}
                      ⭐ {appointment.doctor.rating.toFixed(1)}
                      {appointment.doctor.reviewCount && (
                        <span className="text-muted-foreground">
                          {' '}
                          ({appointment.doctor.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/doctors/${appointment.doctorId}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Doctor information not available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.patient ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </span>
                  </div>
                  {appointment.patient.email && (
                    <p className="text-sm text-muted-foreground">
                      {appointment.patient.email}
                    </p>
                  )}
                  {appointment.patient.phone && (
                    <p className="text-sm text-muted-foreground">
                      {appointment.patient.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Patient information not available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Doctor:</span> {doctorName}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formattedDate}
              </p>
              <p>
                <span className="font-medium">Time:</span> {formattedTime}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
