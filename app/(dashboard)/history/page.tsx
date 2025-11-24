'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Calendar, MapPin, Clock, Video, User, CreditCard,
    CheckCircle2, XCircle, Loader2, ArrowLeft, Star, MessageSquare, Edit2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StarRating } from '@/components/ui/star-rating';
import { ReviewForm } from '@/components/features/reviews/review-form';

interface Appointment {
    appointment_id: string;
    doctor_id: string;
    doctor_name: string;
    doctor_specialty: string;
    doctor_avatar?: string;
    appointment_date: string;
    appointment_type: 'in-person' | 'online';
    status: string;
    amount: number;
    payment_status?: string;
    transaction_id?: string;
    reason?: string;
    has_review?: boolean;
    review?: {
        id: string;
        rating: number;
        comment: string;
    };
}

export default function AppointmentHistoryPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const data = await api.get('/appointments/history');
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        const styles = {
            'completed': 'bg-green-50 text-green-700 border-green-200',
            'confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
            'scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
            'cancelled': 'bg-red-50 text-red-700 border-red-200',
            'no-show': 'bg-gray-50 text-gray-700 border-gray-200',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getPaymentStatusStyles = (status?: string) => {
        if (!status) return 'text-gray-500';
        return status === 'success' ? 'text-green-600' : 'text-red-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-medical-blue" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="font-bold text-gray-900 text-lg">Appointment History</h1>
                </div>
            </div>

            {/* Appointments List */}
            <div className="p-4 space-y-4">
                {appointments.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-900 mb-1">No Appointments Yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Book your first appointment to see it here</p>
                        <Button onClick={() => router.push('/search')} className="bg-medical-blue hover:bg-blue-700">
                            Find a Doctor
                        </Button>
                    </div>
                ) : (
                    appointments.map((appointment, index) => (
                        <motion.div
                            key={appointment.appointment_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* Appointment Card */}
                            <div className="p-5 space-y-4">
                                {/* Doctor Info */}
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-14 w-14 border-2 border-gray-100">
                                        <AvatarImage src={appointment.doctor_avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-medical-blue font-bold text-lg">
                                            {appointment.doctor_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{appointment.doctor_name}</h3>
                                        <p className="text-sm text-gray-600">{appointment.doctor_specialty}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn(
                                                'text-xs font-medium px-2 py-0.5 rounded-full border',
                                                getStatusStyles(appointment.status)
                                            )}>
                                                {appointment.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{format(new Date(appointment.appointment_date), 'hh:mm a')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        {appointment.appointment_type === 'online' ? (
                                            <><Video className="w-4 h-4 text-gray-400" /><span>Online</span></>
                                        ) : (
                                            <><MapPin className="w-4 h-4 text-gray-400" /><span>In-Person</span></>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CreditCard className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold text-gray-900">₹{appointment.amount}</span>
                                    </div>
                                </div>

                                {/* Payment Status */}
                                {appointment.payment_status && (
                                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {appointment.payment_status === 'success' ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            )}
                                            <span className={cn('text-sm font-medium', getPaymentStatusStyles(appointment.payment_status))}>
                                                Payment {appointment.payment_status}
                                            </span>
                                        </div>
                                        {appointment.transaction_id && (
                                            <span className="text-xs text-gray-500 font-mono">
                                                TXN: {appointment.transaction_id.slice(-8)}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Review Section - Only for completed appointments */}
                                {appointment.status === 'completed' && (
                                    <div className="border-t border-gray-100 pt-4">
                                        {appointment.has_review && appointment.review ? (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-semibold text-gray-900">Your Review</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedAppointment(
                                                            selectedAppointment === appointment.appointment_id ? null : appointment.appointment_id
                                                        )}
                                                        className="text-xs h-auto py-1"
                                                    >
                                                        <Edit2 className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>
                                                <StarRating value={appointment.review.rating} readonly size="sm" />
                                                {appointment.review.comment && (
                                                    <p className="text-sm text-gray-700 mt-2">{appointment.review.comment}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-dashed border-2 border-gray-300 hover:border-medical-blue hover:bg-blue-50"
                                                onClick={() => setSelectedAppointment(
                                                    selectedAppointment === appointment.appointment_id ? null : appointment.appointment_id
                                                )}
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Write a Review
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Expandable Review Form */}
                            {selectedAppointment === appointment.appointment_id && appointment.status === 'completed' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-gray-100 p-5 bg-gray-50"
                                >
                                    <ReviewForm
                                        doctorId={appointment.doctor_id}
                                        doctorName={appointment.doctor_name}
                                        appointmentId={appointment.appointment_id}
                                        existingReview={appointment.review}
                                        onSuccess={() => {
                                            setSelectedAppointment(null);
                                            fetchAppointments();
                                        }}
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
