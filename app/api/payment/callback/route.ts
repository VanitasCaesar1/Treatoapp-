import { NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/services/phonepe';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
    try {
        // PhonePe sends data as form-urlencoded in the redirect
        const formData = await request.formData();
        const merchantId = formData.get('merchantId');
        const transactionId = formData.get('transactionId');
        const code = formData.get('code');

        console.log('Payment callback received (POST):', {
            merchantId,
            transactionId,
            code
        });

        if (!transactionId) {
            return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed?error=missing_transaction_id`));
        }

        // Verify payment status
        const statusResponse = await checkPaymentStatus(transactionId.toString());

        console.log('Payment verification result:', {
            success: statusResponse.success,
            code: statusResponse.code,
            state: statusResponse.data?.state
        });

        if (statusResponse.success && statusResponse.code === 'PAYMENT_SUCCESS') {
            // Extract appointment details from metadata
            const metadata = statusResponse.data?.paymentInstrument?.metaInfo;

            if (metadata) {
                // Create appointment in background (fire and forget, handle errors gracefully)
                try {
                    const appointmentData = {
                        doctorId: metadata.udf2,
                        appointmentDate: metadata.udf3,
                        appointmentTime: metadata.udf4,
                        consultationType: metadata.udf5 || 'in-person',
                        duration: parseInt(metadata.udf7) || 30,
                        reason: metadata.udf6 || 'Consultation',
                        notes: metadata.udf8 ? `Booking for ${metadata.udf10 || 'Family Member'}: ${metadata.udf8}` : undefined,
                        guest_details: metadata.udf8 ? {
                            name: metadata.udf8,
                            phone: metadata.udf11,
                            relationship: metadata.udf10
                        } : undefined,
                        paymentStatus: 'paid',
                        paymentTransactionId: transactionId.toString(),
                        paymentAmount: statusResponse.data?.amount ? statusResponse.data.amount / 100 : 0
                    };

                    console.log('Creating appointment from callback:', appointmentData);

                    // Call appointments API to create appointment
                    const appointmentResponse = await fetch(`${BASE_URL}/api/appointments`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(appointmentData)
                    });

                    if (appointmentResponse.ok) {
                        const appointment = await appointmentResponse.json();
                        console.log('Appointment created successfully:', appointment);

                        return NextResponse.redirect(
                            new URL(`${BASE_URL}/payment/success?txnId=${transactionId}&appointmentId=${appointment.id || appointment.appointment_id}`, request.url)
                        );
                    } else {
                        console.error('Failed to create appointment:', await appointmentResponse.text());
                        // Payment succeeded but appointment creation failed
                        return NextResponse.redirect(
                            new URL(`${BASE_URL}/payment/success?txnId=${transactionId}&warning=appointment_creation_failed`, request.url)
                        );
                    }
                } catch (appointmentError) {
                    console.error('Appointment creation error:', appointmentError);
                    // Still redirect to success since payment went through
                    return NextResponse.redirect(
                        new URL(`${BASE_URL}/payment/success?txnId=${transactionId}&warning=appointment_error`, request.url)
                    );
                }
            }

            // No metadata, just redirect to success
            return NextResponse.redirect(new URL(`${BASE_URL}/payment/success?txnId=${transactionId}`, request.url));
        }

        // Payment failed
        return NextResponse.redirect(
            new URL(`${BASE_URL}/payment/failed?txnId=${transactionId}&error=${statusResponse.code || 'payment_failed'}`, request.url)
        );

    } catch (error: any) {
        console.error('Callback Error:', error);
        return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed?error=callback_error`, request.url));
    }
}

// Handle GET requests (PhonePe might use GET in some cases)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const code = searchParams.get('code');

    console.log('Payment callback received (GET):', {
        transactionId,
        code
    });

    if (!transactionId) {
        return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed?error=missing_transaction_id`, request.url));
    }

    try {
        // Verify payment status
        const statusResponse = await checkPaymentStatus(transactionId);

        if (statusResponse.success && statusResponse.code === 'PAYMENT_SUCCESS') {
            // Extract and create appointment (same logic as POST)
            const metadata = statusResponse.data?.paymentInstrument?.metaInfo;

            if (metadata) {
                try {
                    const appointmentData = {
                        doctorId: metadata.udf2,
                        appointmentDate: metadata.udf3,
                        appointmentTime: metadata.udf4,
                        consultationType: metadata.udf5 || 'in-person',
                        duration: parseInt(metadata.udf7) || 30,
                        reason: metadata.udf6 || 'Consultation',
                        notes: metadata.udf8 ? `Booking for ${metadata.udf10 || 'Family Member'}: ${metadata.udf8}` : undefined,
                        paymentStatus: 'paid',
                        paymentTransactionId: transactionId,
                        paymentAmount: statusResponse.data?.amount ? statusResponse.data.amount / 100 : 0
                    };

                    const appointmentResponse = await fetch(`${BASE_URL}/api/appointments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(appointmentData)
                    });

                    if (appointmentResponse.ok) {
                        const appointment = await appointmentResponse.json();
                        return NextResponse.redirect(
                            new URL(`${BASE_URL}/payment/success?txnId=${transactionId}&appointmentId=${appointment.id || appointment.appointment_id}`, request.url)
                        );
                    }
                } catch (appointmentError) {
                    console.error('Appointment creation error (GET):', appointmentError);
                }
            }

            return NextResponse.redirect(new URL(`${BASE_URL}/payment/success?txnId=${transactionId}`, request.url));
        }

        return NextResponse.redirect(
            new URL(`${BASE_URL}/payment/failed?txnId=${transactionId}&error=${statusResponse.code}`, request.url)
        );
    } catch (error) {
        console.error('GET Callback Error:', error);
        return NextResponse.redirect(new URL(`${BASE_URL}/payment/failed?error=verification_failed`, request.url));
    }
}
