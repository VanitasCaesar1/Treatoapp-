'use client';

import { useState } from 'react';
import { Appointment } from '@/lib/types/appointment';
import { SwipeableAppointmentCard } from '@/components/appointments/swipeable-appointment-card';
import { EmptyState } from '@/components/ui/empty-state';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/utils/toast';

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
  const [cancelSheet, setCancelSheet] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  const handleCancel = (id: string) => {
    setCancelSheet({ isOpen: true, id });
  };

  const confirmCancel = async () => {
    if (!cancelSheet.id) return;

    try {
      const response = await fetch(`/api/appointments/${cancelSheet.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        showToast.success('Appointment cancelled successfully');
        // Refresh or update the list
        window.location.reload();
      } else {
        throw new Error('Failed to cancel');
      }
    } catch (error) {
      showToast.error('Failed to cancel appointment');
    } finally {
      setCancelSheet({ isOpen: false, id: null });
    }
  };

  const handleReschedule = (id: string) => {
    // Navigate to reschedule page
    window.location.href = `/appointments/${id}/reschedule`;
  };

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
    <>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <SwipeableAppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={handleCancel}
            onReschedule={handleReschedule}
          />
        ))}
      </div>

      {/* Cancel Confirmation BottomSheet */}
      <BottomSheet
        isOpen={cancelSheet.isOpen}
        onClose={() => setCancelSheet({ isOpen: false, id: null })}
        title="Cancel Appointment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelSheet({ isOpen: false, id: null })}
            >
              Keep Appointment
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={confirmCancel}
            >
              Cancel Appointment
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
