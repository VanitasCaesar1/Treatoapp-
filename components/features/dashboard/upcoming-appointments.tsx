'use client';

import { useAppointments } from '@/lib/hooks/use-appointments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO, isBefore, addHours } from 'date-fns';
import { Appointment } from '@/lib/types/appointment';

export function UpcomingAppointments() {
  const { data: appointments, isLoading, error, refetch } = useAppointments();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorMessage 
            message={error instanceof Error ? error.message : 'Failed to load appointments'} 
            onRetry={refetch} 
          />
        </CardContent>
      </Card>
    );
  }

  // Filter upcoming appointments (scheduled or confirmed)
  const upcomingAppointments = appointments?.data
    ?.filter(
      (apt: Appointment) =>
        (apt.status === 'scheduled' || apt.status === 'confirmed') &&
        isBefore(new Date(), parseISO(`${apt.appointmentDate}T${apt.appointmentTime}`))
    )
    .sort((a: Appointment, b: Appointment) => {
      const dateA = parseISO(`${a.appointmentDate}T${a.appointmentTime}`);
      const dateB = parseISO(`${b.appointmentDate}T${b.appointmentTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Appointments</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/appointments">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming appointments</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/appointments/book">Book an appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment: Appointment) => {
              const appointmentDateTime = parseISO(
                `${appointment.appointmentDate}T${appointment.appointmentTime}`
              );
              const isWithin24Hours = isBefore(
                appointmentDateTime,
                addHours(new Date(), 24)
              );

              return (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          Dr. {appointment.doctor?.firstName}{' '}
                          {appointment.doctor?.lastName}
                        </span>
                      </div>
                      <Badge
                        variant={
                          appointment.status === 'confirmed'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(appointmentDateTime, 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {format(appointmentDateTime, 'hh:mm a')}
                      </div>
                      {appointment.consultationType === 'video' && (
                        <div className="flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" />
                          Video Call
                        </div>
                      )}
                    </div>

                    {appointment.reason && (
                      <p className="text-sm text-muted-foreground">
                        {appointment.reason}
                      </p>
                    )}

                    {isWithin24Hours && (
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant="destructive" className="text-xs">
                          Starting Soon
                        </Badge>
                        {appointment.consultationType === 'video' && (
                          <Button size="sm" asChild>
                            <Link href={`/video/${appointment.videoRoomId}`}>
                              Join Video Call
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
