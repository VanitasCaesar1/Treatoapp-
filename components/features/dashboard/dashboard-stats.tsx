'use client';

import { useAppointments } from '@/lib/hooks/use-appointments';
import { useMedicalHistory } from '@/lib/hooks/use-medical-records';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    Calendar,
    FileText,
    Activity,
    Clock,
} from 'lucide-react';
import { isBefore, parseISO } from 'date-fns';
import { Appointment } from '@/lib/types/appointment';

export function DashboardStats() {
    const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
    const { data: medicalHistory, isLoading: recordsLoading } = useMedicalHistory('current');

    if (appointmentsLoading || recordsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <LoadingSpinner />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Calculate stats
    const upcomingAppointments = appointments?.data?.filter(
        (apt: Appointment) =>
            (apt.status === 'scheduled' || apt.status === 'confirmed') &&
            isBefore(new Date(), parseISO(`${apt.appointmentDate}T${apt.appointmentTime}`))
    ).length || 0;

    const completedAppointments = appointments?.data?.filter(
        (apt: Appointment) => apt.status === 'completed'
    ).length || 0;

    const totalEncounters = medicalHistory?.encounters?.length || 0;
    const totalVitals = medicalHistory?.vitals?.length || 0;

    const stats = [
        {
            title: 'Upcoming Appointments',
            value: upcomingAppointments,
            icon: Calendar,
            color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        },
        {
            title: 'Completed Visits',
            value: completedAppointments,
            icon: Clock,
            color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        },
        {
            title: 'Medical Encounters',
            value: totalEncounters,
            icon: FileText,
            color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        },
        {
            title: 'Vital Records',
            value: totalVitals,
            icon: Activity,
            color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
