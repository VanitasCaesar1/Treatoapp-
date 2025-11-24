'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, RefreshCw, MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function PaymentFailedPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const txnId = searchParams.get('txnId');
    const error = searchParams.get('error');
    const [bookingIntent, setBookingIntent] = useState<any>(null);

    useEffect(() => {
        // Retrieve booking intent for retry
        const intent = localStorage.getItem('bookingIntent');
        if (intent) {
            try {
                setBookingIntent(JSON.parse(intent));
            } catch (e) {
                console.error('Failed to parse booking intent:', e);
            }
        }
    }, []);

    const handleRetry = () => {
        if (bookingIntent) {
            // Navigate back to booking page with saved details
            router.push(`/book-appointment/${bookingIntent.doctorId}`);
        } else {
            router.push('/search');
        }
    };

    const getErrorMessage = (errorCode: string | null) => {
        const errorMessages: Record<string, string> = {
            'PAYMENT_ERROR': 'Payment processing failed',
            'payment_failed': 'Payment was not completed',
            'TRANSACTION_NOT_FOUND': 'Transaction could not be found',
            'BAD_REQUEST': 'Invalid payment request',
            'AUTHORIZATION_FAILED': 'Payment authorization failed',
            'INTERNAL_SERVER_ERROR': 'Payment gateway error',
            'missing_transaction_id': 'Transaction ID missing',
            'invalid_checksum': 'Security verification failed',
            'callback_error': 'Payment processing error',
            'verification_failed': 'Could not verify payment status'
        };
        return errorMessages[errorCode || ''] || 'Payment failed. Please try again.';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Error Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                </div>

                {/* Error Message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-6">
                    {getErrorMessage(error)}
                </p>

                {/* Error Details */}
                {(txnId || error) && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3 text-left">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2 text-sm">
                                {txnId && (
                                    <div>
                                        <span className="text-gray-500">Transaction ID: </span>
                                        <span className="font-mono text-gray-900">#{txnId.slice(-8)}</span>
                                    </div>
                                )}
                                {error && (
                                    <div>
                                        <span className="text-gray-500">Error Code: </span>
                                        <span className="font-mono text-red-700">{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Retry Information */}
                {bookingIntent && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm text-gray-600 mb-2">Your booking details are saved:</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Doctor:</span>
                                <span className="text-gray-900">{bookingIntent.doctorName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span className="text-gray-900">{bookingIntent.date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Time:</span>
                                <span className="text-gray-900">{bookingIntent.time}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleRetry}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-lg shadow-blue-200"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Payment
                    </Button>

                    <Link href="/home" className="block">
                        <Button variant="outline" className="w-full h-12 rounded-xl border-2">
                            Back to Home
                        </Button>
                    </Link>

                    {/* Support Contact */}
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">Need help with this payment?</p>
                        <a href="mailto:support@treato.com" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
