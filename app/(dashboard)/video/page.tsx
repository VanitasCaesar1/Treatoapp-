'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Video, Calendar, Clock, User, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/utils/toast';
import { EmptyState } from '@/components/ui/empty-state';

export default function VideoConsultationsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch upcoming video appointments
            // In a real app, we'd filter by type=video in the API
            const response = await fetch('/api/appointments?upcoming=true', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }

            const data = await response.json();
            // Filter for video appointments client-side for now if API doesn't support it
            const videoAppointments = (data.appointments || []).filter((apt: any) =>
                apt.type?.toLowerCase().includes('video') || apt.isVideo
            );

            setAppointments(videoAppointments);
        } catch (error: any) {
            console.error('Failed to load video appointments:', error);
            setError('Failed to load appointments');
            showToast.error('Could not load video consultations', 'video-error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const { containerRef, isRefreshing } = usePullToRefresh({
        onRefresh: fetchAppointments,
    });

    const isCallActive = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (date.getTime() - now.getTime()) / 1000 / 60; // difference in minutes
        // Active if within 10 minutes before or 30 minutes after start time
        return diff > -30 && diff < 10;
    };

    return (
        <div ref={containerRef} className="min-h-[calc(100vh-140px)] pb-20 space-y-6">
            {/* Pull to refresh indicator */}
            <div className={cn(
                "flex justify-center items-center h-8 overflow-hidden transition-all duration-300",
                isRefreshing ? "opacity-100 mb-4" : "opacity-0 h-0 mb-0"
            )}>
                <Loader2 className="h-5 w-5 animate-spin text-medical-blue" />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Video Consultations</h1>
                    <p className="text-sm text-gray-500">Connect with your doctors online</p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                    <Video className="h-5 w-5 text-orange-600" />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <SkeletonCard className="h-40" />
                    <SkeletonCard className="h-40" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Button onClick={fetchAppointments} variant="outline">Try Again</Button>
                </div>
            ) : appointments.length > 0 ? (
                <div className="space-y-4">
                    {appointments.map((apt) => {
                        const active = isCallActive(apt.date);
                        return (
                            <div
                                key={apt.id}
                                className={cn(
                                    "bg-white rounded-airbnb-lg p-5 border shadow-airbnb-card transition-all",
                                    active ? "border-orange-200 ring-2 ring-orange-100" : "border-gray-100"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                            {apt.doctorImage ? (
                                                <img src={apt.doctorImage} alt={apt.doctorName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{apt.doctorName}</h3>
                                            <p className="text-sm text-gray-500">{apt.specialty || 'General Physician'}</p>
                                        </div>
                                    </div>
                                    {active && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                            Live Now
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-5">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        href={`/video/${apt.id}`}
                                        className={cn(
                                            "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                            active
                                                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        )}
                                        onClick={(e) => !active && e.preventDefault()}
                                    >
                                        <Video className="h-4 w-4" />
                                        Join Call
                                    </Link>
                                    <Link
                                        href={`/appointments/${apt.id}`}
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Details
                                    </Link>
                                </div>
                                {!active && (
                                    <p className="text-xs text-center text-gray-400 mt-3">
                                        Button will be enabled 10 minutes before appointment
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={Video}
                    title="No Video Consultations"
                    description="You don't have any upcoming video consultations scheduled."
                />
            )}

            <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-airbnb-lg p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-2">Need to see a doctor now?</h3>
                <p className="text-indigo-100 text-sm mb-4">
                    Connect with available doctors instantly for urgent consultations.
                </p>
                <Link href="/search?availability=now" className="inline-block bg-white text-indigo-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors">
                    Find Available Doctors
                </Link>
            </div>
        </div>
    );
}
