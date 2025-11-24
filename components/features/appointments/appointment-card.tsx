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
  });
  const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const isUpcoming = appointmentDateTime > new Date() && appointment.status !== 'cancelled';
  const isVideo = appointment.consultationType === 'video';

  return (
    <div
      className={cn(
        "group relative bg-white rounded-airbnb-lg border border-gray-100 shadow-airbnb-card hover:shadow-airbnb-hover transition-all duration-200 overflow-hidden",
        !isUpcoming && "opacity-80 grayscale-[0.3] hover:grayscale-0 hover:opacity-100"
      )}
    >
      {/* Status Strip */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5",
        appointment.status === 'confirmed' ? "bg-green-500" :
          appointment.status === 'scheduled' ? "bg-medical-blue" :
            appointment.status === 'cancelled' ? "bg-red-400" :
              "bg-gray-300"
      )} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                <AvatarImage
                  src={appointment.doctor?.profileImage}
                  alt={`${doctorName}'s profile picture`}
                />
                <AvatarFallback className="bg-medical-blue-50 text-medical-blue font-bold">
                  {appointment.doctor?.firstName?.[0]}
                  {appointment.doctor?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {isVideo && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                  <div className="bg-green-500 rounded-full p-1">
                    <Video className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 truncate pr-2">{doctorName}</h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    statusColors[appointment.status]
                  )}
                >
                  {appointment.status.replace('-', ' ')}
                </Badge>
              </div>

              {appointment.doctor?.specialty && (
                <p className="text-sm text-medical-blue font-medium mb-3">
                  {appointment.doctor.specialty}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium">{formattedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <ConsultationIcon className="h-3.5 w-3.5" />
            <span className="capitalize">{appointment.consultationType.replace('-', ' ')} Visit</span>
          </div>

          <Link
            href={`/appointments/${appointment.id}`}
            className="text-sm font-semibold text-medical-blue hover:text-medical-blue-dark flex items-center gap-1 transition-colors active:scale-95"
          >
            Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
