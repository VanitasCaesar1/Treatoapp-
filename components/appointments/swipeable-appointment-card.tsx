'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Calendar, Clock, User, X, CalendarClock, MapPin } from 'lucide-react';
import { Appointment } from '@/lib/types/appointment';
import { useCapacitor } from '@/lib/capacitor';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SwipeableAppointmentCardProps {
    appointment: Appointment;
    onCancel?: (id: string) => void;
    onReschedule?: (id: string) => void;
}

const SWIPE_THRESHOLD = 100;
const REVEAL_THRESHOLD = 60;

export function SwipeableAppointmentCard({
    appointment,
    onCancel,
    onReschedule,
}: SwipeableAppointmentCardProps) {
    const capacitor = useCapacitor();
    const x = useMotionValue(0);
    const [isRevealed, setIsRevealed] = useState<'cancel' | 'reschedule' | null>(null);

    // Transform x position to action background opacity
    const cancelOpacity = useTransform(x, [-SWIPE_THRESHOLD, -REVEAL_THRESHOLD, 0], [1, 0.7, 0]);
    const rescheduleOpacity = useTransform(x, [0, REVEAL_THRESHOLD, SWIPE_THRESHOLD], [0, 0.7, 1]);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const offset = info.offset.x;

        // Swipe left (cancel)
        if (offset < -SWIPE_THRESHOLD) {
            capacitor.mediumHaptic();
            setIsRevealed('cancel');
            x.set(-REVEAL_THRESHOLD);
        }
        // Swipe right (reschedule)
        else if (offset > SWIPE_THRESHOLD) {
            capacitor.mediumHaptic();
            setIsRevealed('reschedule');
            x.set(REVEAL_THRESHOLD);
        }
        // Not enough swipe, snap back
        else {
            if (Math.abs(offset) > 10) {
                capacitor.lightHaptic();
            }
            setIsRevealed(null);
            x.set(0);
        }
    };

    const handleCancel = () => {
        capacitor.heavyHaptic();
        onCancel?.(appointment.id);
        x.set(0);
        setIsRevealed(null);
    };

    const handleReschedule = () => {
        capacitor.mediumHaptic();
        onReschedule?.(appointment.id);
        x.set(0);
        setIsRevealed(null);
    };

    const handleCardClick = () => {
        if (isRevealed) {
            // If actions are revealed, hide them
            x.set(0);
            setIsRevealed(null);
        }
    };

    const statusColors = {
        scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
        confirmed: 'bg-green-50 text-green-700 border-green-200',
        completed: 'bg-gray-50 text-gray-700 border-gray-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className="relative overflow-hidden rounded-airbnb-lg">
            {/* Action Backgrounds */}
            <div className="absolute inset-0 flex">
                {/* Cancel action (left) */}
                <motion.div
                    style={{ opacity: cancelOpacity }}
                    className="flex-1 bg-red-500 flex items-center justify-end px-6"
                >
                    <div className="flex flex-col items-center gap-1">
                        <X className="h-6 w-6 text-white" />
                        <span className="text-xs font-semibold text-white">Cancel</span>
                    </div>
                </motion.div>

                {/* Reschedule action (right) */}
                <motion.div
                    style={{ opacity: rescheduleOpacity }}
                    className="flex-1 bg-medical-blue flex items-center justify-start px-6"
                >
                    <div className="flex flex-col items-center gap-1">
                        <CalendarClock className="h-6 w-6 text-white" />
                        <span className="text-xs font-semibold text-white">Reschedule</span>
                    </div>
                </motion.div>
            </div>

            {/* Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                style={{ x }}
                onDragEnd={handleDragEnd}
                onClick={handleCardClick}
                className={cn(
                    "relative bg-white border border-gray-200 rounded-airbnb-lg p-4",
                    "shadow-airbnb-card hover:shadow-airbnb-hover transition-shadow",
                    "cursor-pointer select-none-touch tap-highlight-none"
                )}
            >
                <Link href={`/appointments/${appointment.id}`} className="block">
                    <div className="flex gap-4">
                        {/* Left */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-base text-gray-900 mb-1">
                                        {appointment.doctorName || 'Doctor'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {appointment.specialty || 'General Consultation'}
                                    </p>
                                </div>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                                    statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled
                                )}>
                                    {appointment.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</span>
                                </div>

                                {appointment.appointmentTime && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{appointment.appointmentTime}</span>
                                    </div>
                                )}

                                {appointment.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="truncate">{appointment.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Revealed Actions */}
                {isRevealed && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        {isRevealed === 'cancel' ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCancel();
                                }}
                                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Cancel Appointment
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleReschedule();
                                }}
                                className="flex-1 h-11 bg-medical-blue hover:bg-medical-blue-dark text-white rounded-lg font-medium active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CalendarClock className="h-4 w-4" />
                                Reschedule
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCardClick();
                            }}
                            className="h-11 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
