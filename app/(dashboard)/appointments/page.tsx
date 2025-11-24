'use client';

import { useState, useCallback } from 'react';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { AppointmentList } from '@/components/features/appointments/appointment-list';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error/error-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { Appointment } from '@/lib/types/appointment';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const {
    data: appointmentsData,
    isLoading,
    error,
    refetch,
  } = useAppointments();

  const { containerRef, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
  });

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ErrorDisplay
          message={error?.message || 'Failed to load appointments'}
          onRetry={() => refetch()}
          variant="page"
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
    <div ref={containerRef} className="min-h-[calc(100vh-140px)] pb-20">
      {/* Pull to refresh indicator */}
      <div className={cn(
        "flex justify-center items-center h-8 overflow-hidden transition-all duration-300",
        isRefreshing ? "opacity-100 mb-4" : "opacity-0 h-0 mb-0"
      )}>
        <Loader2 className="h-5 w-5 animate-spin text-medical-blue" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage your visits
            </p>
          </div>
          <Link href="/search">
            <Button className="rounded-full bg-medical-blue hover:bg-medical-blue-dark shadow-medical hover:shadow-medical-lg transition-all active:scale-95 h-10 w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
              <Plus className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Book New</span>
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100/80 p-1 rounded-xl">
            <TabsTrigger
              value="upcoming"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-medical-blue data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <div className="animate-slide-up">
            {isLoading ? (
              <div className="space-y-4">
                <SkeletonCard className="h-40" />
                <SkeletonCard className="h-40" />
              </div>
            ) : (
              <>
                <TabsContent value="upcoming" className="mt-0 focus-visible:outline-none">
                  <AppointmentList
                    appointments={upcomingAppointments}
                    emptyMessage="No upcoming appointments"
                    emptyDescription="You don't have any upcoming appointments scheduled."
                  />
                </TabsContent>

                <TabsContent value="past" className="mt-0 focus-visible:outline-none">
                  <AppointmentList
                    appointments={pastAppointments}
                    emptyMessage="No past appointments"
                    emptyDescription="Your appointment history will appear here."
                  />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
