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
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Upcoming</h3>
        <div className="bg-white rounded-airbnb-lg border border-gray-200 p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Upcoming</h3>
        <div className="bg-white rounded-airbnb-lg border border-gray-200 p-6 text-center">
          <ErrorMessage 
            message={error instanceof Error ? error.message : 'Failed to load appointments'} 
          />
          <Button size="sm" onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Upcoming</h3>
        {upcomingAppointments.length > 0 && (
          <Link href="/appointments" className="text-sm text-blue-600">
            See all
          </Link>
        )}
      </div>
      
      {upcomingAppointments.length === 0 ? (
        <div className="bg-white rounded-airbnb-lg border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 bg-medical-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-7 w-7 text-medical-blue" />
          </div>
          <p className="text-sm text-gray-600 mb-4">No upcoming appointments</p>
          <Button size="sm" asChild>
            <Link href="/appointments/book">Book Appointment</Link>
          </Button>
        </div>
      ) : (
          <div className="space-y-2">
            {upcomingAppointments.map((appointment: Appointment) => {
              const appointmentDateTime = parseISO(
                `${appointment.appointmentDate}T${appointment.appointmentTime}`
              );
              const isWithin24Hours = isBefore(
                appointmentDateTime,
                addHours(new Date(), 24)
              );

              return (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="block bg-white rounded-airbnb-lg border border-gray-200 p-4 hover:shadow-airbnb-lg transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </span>
                    {appointment.consultationType === 'video' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Video className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(appointmentDateTime, 'MMM dd')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(appointmentDateTime, 'hh:mm a')}
                    </div>
                  </div>

                  {isWithin24Hours && (
                    <div className="mt-2 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full w-fit">
                      Starting Soon
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
    </div>
  );
}
