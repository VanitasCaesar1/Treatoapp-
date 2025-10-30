'use client';

import { useState } from 'react';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { AppointmentList } from '@/components/features/appointments/appointment-list';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Appointment } from '@/lib/types/appointment';

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const {
    data: appointmentsData,
    isLoading,
    error,
    refetch,
  } = useAppointments();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage
          message={error?.message || 'Failed to load appointments'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const appointments = appointmentsData?.data || [];

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter((apt: Appointment) => {
    const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
    return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
  });

  const pastAppointments = appointments.filter((apt: Appointment) => {
    const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
    return aptDate < now || apt.status === 'cancelled' || apt.status === 'completed';
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/doctors">
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments Overview</CardTitle>
          <CardDescription>
            You have {upcomingAppointments.length} upcoming appointment
            {upcomingAppointments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              <AppointmentList
                appointments={upcomingAppointments}
                emptyMessage="No upcoming appointments"
                emptyDescription="You don't have any upcoming appointments. Book one now!"
              />
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              <AppointmentList
                appointments={pastAppointments}
                emptyMessage="No past appointments"
                emptyDescription="Your appointment history will appear here."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
