'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Calendar, Clock, User, Receipt } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const txnId = searchParams.get('txnId');
    const appointmentId = searchParams.get('appointmentId');
    const warning = searchParams.get('warning');
    const [bookingIntent, setBookingIntent] = useState<any>(null);

    useEffect(() => {
        // Clear booking intent from localStorage
        const intent = localStorage.getItem('bookingIntent');
        if (intent) {
            try {
                setBookingIntent(JSON.parse(intent));
                // Clear it after reading
                localStorage.removeItem('bookingIntent');
            } catch (e) {
                console.error('Failed to parse booking intent:', e);
            }
        }

        // Show warning toast if appointment creation failed
        if (warning === 'appointment_creation_failed') {
            toast.error('Payment successful, but appointment creation failed. Please contact support with transaction ID: ' + txnId);
        } else if (warning === 'appointment_error') {
            toast.error('Payment successful, but there was an issue creating your appointment. Please contact support.');
        }
    }, [warning, txnId]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                {/* Success Message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Your appointment has been confirmed
                </p>

                {/* Transaction Details */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                    {txnId && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-2">
                                <Receipt className="w-4 h-4" />
                                Transaction ID
                            </span>
                            <span className="font-mono text-gray-900">#{txnId.slice(-8)}</span>
                        </div>
                    )}

                    {bookingIntent && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Doctor
                                </span>
                                <span className="text-gray-900">{bookingIntent.doctorName}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date
                                </span>
                                <span className="text-gray-900">{bookingIntent.date}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Time
                                </span>
                                <span className="text-gray-900">{bookingIntent.time}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                                <span className="text-gray-700 font-medium">Amount Paid</span>
                                <span className="text-green-600 font-bold">₹{bookingIntent.amount}</span>
                            </div>
                        </>
                    )}

                    {appointmentId && (
                        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                            <span className="text-gray-500">Appointment ID</span>
                            <span className="font-mono text-gray-900">{appointmentId}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link href="/appointments" className="block">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl shadow-lg shadow-green-200">
                            View My Appointments
                        </Button>
                    </Link>
                    <Link href="/home" className="block">
                        <Button variant="outline" className="w-full h-12 rounded-xl border-2">
                            Back to Home
                        </Button>
                    </Link>
                </div>

                {/* Helpful Note */}
                <p className="text-xs text-gray-500 mt-6">
                    A confirmation has been sent to your registered email address
                </p>
            </div>
        </div>
    );
}
