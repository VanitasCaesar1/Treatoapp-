'use client';

import { useState } from 'react';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { AppointmentList } from '@/components/features/appointments/appointment-list';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error/error-display';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Calendar, Clock, CalendarCheck, History, Search } from 'lucide-react';
import Link from 'next/link';
import { Appointment } from '@/lib/types/appointment';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

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
      <div className="min-h-screen p-4">
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

  // Get next appointment for highlight
  const nextAppointment = upcomingAppointments[0];

  // Format date helper
  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'EEE, MMM d');
    } catch {
      return dateStr;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen pb-24">
      {/* Pull to refresh indicator */}
      <div className={cn(
        "flex justify-center items-center h-8 overflow-hidden transition-all duration-300",
        isRefreshing ? "opacity-100 mb-4" : "opacity-0 h-0 mb-0"
      )}>
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>

      <div className="p-4 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Appointments</h1>
              <p className="text-xs text-gray-500">
                {upcomingAppointments.length} upcoming
              </p>
            </div>
          </div>
          <Link href="/search">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-sm h-10 px-4">
              <Plus className="h-4 w-4 mr-1" />
              Book
            </Button>
          </Link>
        </div>

        {/* Next Appointment Highlight */}
        {nextAppointment && !isLoading && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-blue-200" />
                <span className="text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Next Appointment
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1">
                Dr. {nextAppointment.doctorName || 'Doctor'}
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                {nextAppointment.specialty || nextAppointment.consultationType || 'Consultation'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                    <p className="text-xs text-blue-100">Date</p>
                    <p className="font-bold text-sm">
                      {formatAppointmentDate(nextAppointment.appointmentDate)}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                    <p className="text-xs text-blue-100">Time</p>
                    <p className="font-bold text-sm">{nextAppointment.appointmentTime}</p>
                  </div>
                </div>
                <Link href={`/appointments/${nextAppointment.id}`}>
                  <Button 
                    size="sm" 
                    className="bg-white text-blue-600 hover:bg-blue-50 rounded-full font-semibold h-9 px-4"
                  >
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === 'upcoming'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <CalendarCheck className="h-4 w-4" />
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
              activeTab === 'past'
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <History className="h-4 w-4" />
            Past ({pastAppointments.length})
          </button>
        </div>

        {/* Appointment List */}
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard className="h-32 rounded-2xl" />
            <SkeletonCard className="h-32 rounded-2xl" />
            <SkeletonCard className="h-32 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'upcoming' ? (
              upcomingAppointments.length > 0 ? (
                <AppointmentList
                  appointments={upcomingAppointments}
                  emptyMessage="No upcoming appointments"
                  emptyDescription="You don't have any upcoming appointments scheduled."
                />
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-blue-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">No upcoming appointments</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                    Book an appointment with a doctor to get started
                  </p>
                  <Link href="/search">
                    <Button className="rounded-full bg-blue-600 hover:bg-blue-700">
                      <Search className="h-4 w-4 mr-2" />
                      Find a Doctor
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              pastAppointments.length > 0 ? (
                <AppointmentList
                  appointments={pastAppointments}
                  emptyMessage="No past appointments"
                  emptyDescription="Your appointment history will appear here."
                />
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">No past appointments</h3>
                  <p className="text-sm text-gray-500">
                    Your appointment history will appear here
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
