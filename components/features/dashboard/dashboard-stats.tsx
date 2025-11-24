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
            color: 'bg-primary/10 text-primary',
        },
        {
            title: 'Completed Visits',
            value: completedAppointments,
            icon: Clock,
            color: 'bg-green-500/10 text-green-600 dark:text-green-400',
        },
        {
            title: 'Medical Encounters',
            value: totalEncounters,
            icon: FileText,
            color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        },
        {
            title: 'Vital Records',
            value: totalVitals,
            icon: Activity,
            color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Your cards</h3>
                <button className="text-sm text-primary font-medium flex items-center gap-1">
                    <span>+</span> New card
                </button>
            </div>
            <div className="relative">
                {/* Main Card */}
                <div className="bg-gradient-to-br from-[#C5FF41] to-[#A8E034] rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-sm font-medium text-gray-800">N.</span>
                            <div className="flex gap-1">
                                <div className="w-8 h-8 rounded-full bg-red-500"></div>
                                <div className="w-8 h-8 rounded-full bg-orange-400 -ml-3"></div>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-700 mb-1">Debit Card</p>
                            <p className="text-lg font-bold text-gray-900">•••• 4568</p>
                        </div>
                        
                        <button className="text-sm text-gray-800 font-medium flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Details
                        </button>
                    </div>
                </div>
                
                {/* Card Stack Effect */}
                <div className="absolute -bottom-2 left-4 right-4 h-4 bg-gray-900/80 rounded-b-3xl -z-10"></div>
            </div>
        </div>
    );
}
