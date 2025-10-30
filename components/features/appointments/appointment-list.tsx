'use client';

import { Appointment } from '@/lib/types/appointment';
import { AppointmentCard } from './appointment-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar } from 'lucide-react';

interface AppointmentListProps {
  appointments: Appointment[];
  emptyMessage?: string;
  emptyDescription?: string;
}

export function AppointmentList({
  appointments,
  emptyMessage = 'No appointments found',
  emptyDescription = 'You don\'t have any appointments scheduled.',
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
