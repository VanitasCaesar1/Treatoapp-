'use client';

import { Appointment } from '@/lib/types/appointment';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, Phone, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
}

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

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const doctorName = appointment.doctor
    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : 'Doctor';

  const ConsultationIcon = consultationTypeIcons[appointment.consultationType];

  const appointmentDateTime = new Date(
    `${appointment.appointmentDate}T${appointment.appointmentTime}`
  );
  const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const isUpcoming = appointmentDateTime > new Date() && appointment.status !== 'cancelled';

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-shadow',
        !isUpcoming && 'opacity-75'
      )}
      role="article"
      aria-label={`Appointment with ${doctorName} on ${formattedDate} at ${formattedTime}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={appointment.doctor?.profileImage}
                alt={`${doctorName}'s profile picture`}
              />
              <AvatarFallback>
                {appointment.doctor?.firstName?.[0]}
                {appointment.doctor?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-lg">{doctorName}</h3>
                {appointment.doctor?.specialty && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctor.specialty}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={appointment.appointmentDate}>{formattedDate}</time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={appointment.appointmentTime}>{formattedTime}</time>
                </div>
                <div className="flex items-center gap-1.5">
                  <ConsultationIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="capitalize">{appointment.consultationType.replace('-', ' ')}</span>
                </div>
              </div>

              {appointment.reason && (
                <p className="text-sm">
                  <span className="font-medium">Reason:</span> {appointment.reason}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={statusColors[appointment.status]}
                  aria-label={`Status: ${appointment.status.replace('-', ' ')}`}
                >
                  <span className="capitalize">{appointment.status.replace('-', ' ')}</span>
                </Badge>
                {appointment.duration && (
                  <Badge variant="outline" aria-label={`Duration: ${appointment.duration} minutes`}>
                    {appointment.duration} min
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" asChild>
            <Link 
              href={`/appointments/${appointment.id}`}
              aria-label={`View details for appointment with ${doctorName}`}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
